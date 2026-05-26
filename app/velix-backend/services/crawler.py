import re
import requests
from config import settings

class CrawlerService:
    @staticmethod
    def extract_colors_from_html(html: str) -> dict:
        if not html:
            return {}
        
        # Find all style tags contents
        style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', html, re.DOTALL | re.IGNORECASE)
        # Find all inline style attributes
        inline_styles = re.findall(r'style\s*=\s*["\'](.*?)["\']', html, re.IGNORECASE)
        
        all_styles = " ".join(style_blocks + inline_styles)
        
        # Match hex colors
        hex_colors = re.findall(r'#(?:[0-9a-fA-F]{3,4}){1,2}\b', all_styles)
        # Match rgb/rgba colors
        rgba_colors = re.findall(r'rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[0-9.]+\s*)?\)', all_styles)
        
        # Deduplicate and normalize colors
        unique_hex = sorted(list(set(c.upper() for c in hex_colors)))
        unique_rgba = sorted(list(set(rgba_colors)))
        
        # Find CSS variables that look like colors
        css_vars = re.findall(r'(--[\w-]+)\s*:\s*([^;}]+)', all_styles)
        color_vars = {}
        for var_name, var_val in css_vars:
            val_clean = var_val.strip()
            # If the variable contains a hex or rgb color, keep it
            if re.search(r'#(?:[0-9a-fA-F]{3,4}){1,2}\b|rgba?\(', val_clean):
                color_vars[var_name] = val_clean
                
        return {
            "detected_hex_colors": unique_hex,
            "detected_rgba_colors": unique_rgba,
            "css_color_variables": color_vars
        }

    @staticmethod
    def extract_page_content(url: str) -> dict:
        headers = {
            "Authorization": f"Bearer {settings.NIMBLE_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": url,
            "formats": ["markdown", "html"],
            "render": True
        }
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
            html_content = data_obj.get("html") or ""
            
            # Extract colors and styles from HTML
            style_info = CrawlerService.extract_colors_from_html(html_content)
            
            return {
                "markdown": markdown_content,
                "style_info": style_info
            }
        except Exception as e:
            raise Exception(f"Crawler failed to extract content: {str(e)}")

