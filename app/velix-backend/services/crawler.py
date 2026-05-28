import re
import json
import os
from config import settings
from playwright.async_api import async_playwright
import html2text

class CrawlerService:
    @staticmethod
    def process_playwright_styles(styles: list, css_vars: dict) -> dict:
        # Collect all unique colors from element styles
        rgba_set = set()
        hex_set = set()
        
        def parse_color(color_str: str):
            if not color_str or color_str == "transparent" or color_str == "rgba(0, 0, 0, 0)":
                return
            
            # Check if it is rgb or rgba
            rgb_match = re.match(r'rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)', color_str)
            if rgb_match:
                rgba_set.add(color_str)
                # Convert to hex
                r = int(rgb_match.group(1))
                g = int(rgb_match.group(2))
                b = int(rgb_match.group(3))
                a = float(rgb_match.group(4)) if rgb_match.group(4) is not None else 1.0
                if a > 0: # only extract visible colors
                    hex_str = f"#{r:02X}{g:02X}{b:02X}"
                    hex_set.add(hex_str)
            elif color_str.startswith("#"):
                hex_set.add(color_str.upper())
                
        for item in styles:
            el_styles = item.get("styles", {})
            parse_color(el_styles.get("color"))
            parse_color(el_styles.get("background")) # background contains backgroundColor
            
        # Add CSS variable values to unique lists if they are colors
        for var_name, var_val in css_vars.items():
            parse_color(var_val)
            
        return {
            "detected_hex_colors": sorted(list(hex_set)),
            "detected_rgba_colors": sorted(list(rgba_set)),
            "css_color_variables": css_vars
        }

    @staticmethod
    async def extract_page_content(url: str) -> dict:
        import requests
        
        # 1. Extract content (markdown and HTML) using Nimble API
        headers = {
            "Authorization": f"Bearer {settings.NIMBLE_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": url,
            "formats": ["markdown", "html"],
            "render": True
        }
        
        markdown_content = ""
        try:
            response = requests.post(
                "https://sdk.nimbleway.com/v1/extract",
                json=payload,
                headers=headers,
                timeout=45
            )
            response.raise_for_status()
            res_data = response.json()
            data_obj = res_data.get("data") or {}
            markdown_content = data_obj.get("markdown") or ""
        except Exception as nimble_err:
            print(f"Warning: Nimble content extraction failed: {str(nimble_err)}")
            
        # 2. Extract styles and colors using Playwright
        style_info = {}
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.set_extra_http_headers({
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                })
                # Go to page and wait for networkidle
                await page.goto(url, wait_until="networkidle", timeout=30000)
                
                # Extract styles of all elements using the user's custom JS snippet
                # and also extract CSS variable colors
                styles_and_vars = await page.evaluate("""
                () => {
                    const elements = [...document.querySelectorAll("*")];
                    const styles = elements.map(el => {
                        const s = getComputedStyle(el);
                        return {
                            tag: el.tagName,
                            className: el.className,
                            id: el.id,
                            styles: {
                                color: s.color,
                                background: s.backgroundColor,
                                fontSize: s.fontSize,
                                fontFamily: s.fontFamily,
                                fontWeight: s.fontWeight,
                                padding: s.padding,
                                margin: s.margin,
                                borderRadius: s.borderRadius,
                                boxShadow: s.boxShadow,
                                width: s.width,
                                height: s.height,
                                display: s.display
                            }
                        };
                    });
                    
                    // Extract CSS variable colors from all stylesheets
                    const cssVars = {};
                    try {
                        for (const sheet of document.styleSheets) {
                            try {
                                const rules = sheet.cssRules || sheet.rules;
                                if (!rules) continue;
                                for (const rule of rules) {
                                    if (rule.style) {
                                        for (let i = 0; i < rule.style.length; i++) {
                                            const prop = rule.style[i];
                                            if (prop.startsWith('--')) {
                                                const val = rule.style.getPropertyValue(prop).trim();
                                                if (val && (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl'))) {
                                                    cssVars[prop] = val;
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (e) {
                                // Ignore cross-origin stylesheet errors
                            }
                        }
                    } catch (e) {
                        // General error handling
                    }
                    
                    return {
                        styles: styles,
                        cssVars: cssVars
                    };
                }
                """)
                
                await browser.close()
                
            styles = styles_and_vars.get("styles", [])
            css_vars = styles_and_vars.get("cssVars", {})
            
            # Write styles to styles.json in the current working directory as requested
            try:
                with open("styles.json", "w") as f:
                    json.dump(styles, f, indent=2)
            except Exception as write_err:
                print(f"Warning: Failed to write styles.json: {str(write_err)}")
                
            # Extract color info from the computed styles and variables
            style_info = CrawlerService.process_playwright_styles(styles, css_vars)
            
        except Exception as playwright_err:
            print(f"Warning: Playwright style extraction failed: {str(playwright_err)}")
            style_info = None
                
        # Return Nimble markdown content and Playwright style info
        if not markdown_content:
            raise Exception("Nimble content extraction failed and returned no markdown.")
            
        return {
            "markdown": markdown_content,
            "style_info": style_info
        }

