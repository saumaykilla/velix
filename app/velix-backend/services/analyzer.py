from google import genai
from pydantic import BaseModel, Field
from typing import List
from config import settings

class BrandColors(BaseModel):
    primary: str = Field(description="Primary theme color (hex code e.g. #F97316)")
    secondary: str = Field(description="Secondary accent color (hex code e.g. #FD933D)")
    background: str = Field(description="Background color (hex code e.g. #FAF8FF)")
    surface: str = Field(description="Surface color (hex code e.g. #FFFFFF)")

class Competitor(BaseModel):
    name: str = Field(description="Name of the main competitor")
    website: str = Field(description="Website URL of the competitor")
    strength: str = Field(description="Competitor's strength")
    weakness: str = Field(description="Competitor's weakness")

class BrandAnalysis(BaseModel):
    core_mission: str = Field(description="The primary mission and core value proposition of the product")
    target_audience: str = Field(description="A description of the target audience and primary demographics")
    personality_traits: List[str] = Field(description="List of 3-5 brand personality traits (e.g. bold, analytical, premium)")
    brand_colors: BrandColors = Field(description="Harmonious color palette recommended based on the website style or product domain")
    competitor: Competitor = Field(description="Analyzed key competitor in the space")

class AnalyzerService:
    @staticmethod
    def analyze_brand(scraped_content: str, user_description: str, style_info: dict = None) -> BrandAnalysis:
        # Initialize Google GenAI client configured for Vertex AI
        client = genai.Client(
            vertexai=True,
            project=settings.GOOGLE_PROJECT_ID or None,
            location=settings.GOOGLE_LOCATION
        )

        prompt = f"""
        You are an expert brand analyst. Analyze the following scraped website content and user description of a product to extract and suggest comprehensive brand details.
        
        Scraped Website Content:
        \"\"\"
        {scraped_content}
        \"\"\"
        
        User's Product Description:
        \"\"\"
        {user_description}
        \"\"\"
        """

        if style_info:
            prompt += f"""
        Detected CSS & Website Colors:
        - Detected Hex Colors: {style_info.get('detected_hex_colors', [])}
        - Detected RGBA Colors: {style_info.get('detected_rgba_colors', [])}
        - CSS Color Variables: {style_info.get('css_color_variables', {})}
        
        IMPORTANT: Your suggested color palette (primary, secondary, background, surface) MUST be selected/derived directly from the detected CSS styles/colors of the website above.
        For example:
        - The "background" and "surface" colors should match the light/dark mode setup of the website (e.g. if the site is dark mode, select a dark background like `#0F172A` or `#000000` from the variables or colors, and if it's light mode, select a light background like `#FFFFFF` or `#FAF8FF`).
        - The "primary" and "secondary" colors should match key accent colors used in the website stylesheets (e.g., matching theme colors, brand buttons, logo highlights).
        Do NOT generate random colors.
        """

        prompt += """
        Provide the analysis structured exactly matching the requested schema.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": BrandAnalysis
            }
        )

        # Retrieve structured Pydantic object
        analysis: BrandAnalysis = response.parsed
        return analysis

