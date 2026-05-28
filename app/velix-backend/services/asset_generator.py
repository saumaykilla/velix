import json
import logging
import uuid
import requests
from typing import TypedDict, List, Dict, Optional
from google import genai
from google.genai import types
from langgraph.graph import StateGraph, START, END
from config import settings
from services.database import DatabaseService

# Initialize logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("asset_generator")

# --- State definition ---
class AssetState(TypedDict):
    workspace_id: str
    campaign_id: str
    platform: str
    brand_core_mission: Optional[str]
    brand_target_audience: Optional[str]
    brand_personality_traits: Optional[List[str]]
    brand_colors: Optional[Dict]
    strategy_objective: Optional[str]
    personas_info: Optional[List[Dict]]
    
    # Campaign notes and previous assets context
    campaign_purpose: Optional[str]
    previous_assets_info: Optional[List[Dict]]
    
    # Story agent output
    story: Optional[str]
    story_feedback: Optional[str]
    
    # Prompt generator output
    image_prompt: Optional[str]
    caption: Optional[str]
    prompt_feedback: Optional[str]
    
    # Feedback approval state
    approved: Optional[bool]
    iterations: int
    
    # Outputs of generation/upload
    image_bytes: Optional[bytes]
    media_url: Optional[str]
    asset_id: Optional[str]
    error: Optional[str]

# --- LLM Client initialization ---
def get_genai_client():
    return genai.Client(
        vertexai=True,
        project=settings.GOOGLE_PROJECT_ID or None,
        location=settings.GOOGLE_LOCATION
    )

# --- Node 1: Story Agent Node ---
def story_agent_node(state: AssetState) -> Dict:
    logger.info("StoryAgent: Designing a storytelling concept for campaign '%s'", state['campaign_id'])
    client = get_genai_client()
    
    personas_str = json.dumps(state.get('personas_info', []), indent=2)
    prev_assets_str = json.dumps(state.get('previous_assets_info', []), indent=2)
    
    prompt = f"""
    You are an expert creative researcher and brand storyteller. Your goal is to find the best narrative story or visual metaphor to convey the campaign's core insight.
    
    Campaign Context:
    - Strategy Objective: {state.get('strategy_objective')}
    - Campaign Notes/Purpose: {state.get('campaign_purpose')}
    
    Target Personas:
    {personas_str}
    
    Previous 10 Generated Assets (Prompts & Notes):
    {prev_assets_str}
    
    Instructions:
    1. Develop a compelling visual story, metaphor, or creative theme that illustrates the product's value proposition.
    2. Ensure the narrative directly appeals to the target personas and objective.
    3. Crucially, verify that the visual concept is fresh and does NOT duplicate the visual themes, scenes, or concepts of the previous 10 generated assets.
    """
    
    if state.get("story_feedback"):
        prompt += f"""
    
    Self-Improvement Feedback:
    You have received the following feedback from the Feedback Agent on your previous draft:
    \"{state.get('story_feedback')}\"
    
    Refine your visual story concept to address this feedback directly.
    """
        
    prompt += """
    
    Provide your visual storytelling concept description. Focus on the visual details, key metaphor, and focal points.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        story_content = response.text.strip()
        logger.info("StoryAgent: Story concept generated successfully:\n%s", story_content)
        return {
            "story": story_content
        }
    except Exception as e:
        logger.error("StoryAgent failed: %s", str(e))
        return {"error": f"Story agent node failed: {str(e)}"}

# --- Node 2: Prompt Generator Agent Node ---
def prompt_generator_node(state: AssetState) -> Dict:
    logger.info("PromptGeneratorAgent: Creating detailed image generation prompt and caption for platform '%s'", state['platform'])
    client = get_genai_client()

    brand_colors_str = json.dumps(state.get('brand_colors', {}))
    personas_str = json.dumps(state.get('personas_info', []), indent=2)

    prompt = f"""
    You are a premium creative director agent. Your task is to translate a storytelling concept into a highly descriptive image generation prompt and a platform-specific social media post caption.
    
    The asset is targeted for the platform: {state['platform']}
    
    Workspace Brand Context:
    - Core Mission: {state.get('brand_core_mission')}
    - Target Audience: {state.get('brand_target_audience')}
    - Personality Traits: {state.get('brand_personality_traits')}
    - Brand Colors: {brand_colors_str}
    
    Storytelling Concept to Convey:
    \"\"\"
    {state.get('story')}
    \"\"\"
    
    Instructions for generating the image prompt:
    1. Detail a single, coherent visual composition that embodies the storytelling concept.
    2. Incorporate the specified brand colors naturally (describe them visually, e.g. "frosted orange accents", "soft amber glow", "clean slate grey shadows").
    3. The style should be modern, clean, premium SaaS aesthetic (e.g. minimalist studio lighting, 3D shapes, or professional abstract layouts).
    4. Crucially, do NOT include any text or logos in the image.
    5. Keep the visual prompt clean and descriptive (suitable for text-to-image models).
    
    Instructions for the caption:
    1. Write a compelling post caption/copy matching the target audience, story, and platform tone (e.g. professional and value-focused for LinkedIn, engaging and concise for Instagram, snappy/conversational for TikTok).
    """
    
    if state.get("prompt_feedback"):
        prompt += f"""
    
    Self-Improvement Feedback:
    You have received the following feedback from the Feedback Agent on your previous draft:
    \"{state.get('prompt_feedback')}\"
    
    Refine your image prompt and caption to address this feedback directly.
    """
        
    prompt += """
    
    You MUST respond in raw JSON format matching this schema:
    {
        "image_prompt": "A detailed 1-2 sentence prompt for the image generator",
        "caption": "The post caption text"
    }
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )
        data = json.loads(response.text)
        logger.info("PromptGeneratorAgent: Successfully generated prompt and caption.\nJSON Output:\n%s", json.dumps(data, indent=2))
        return {
            "image_prompt": data.get("image_prompt"),
            "caption": data.get("caption")
        }
    except Exception as e:
        logger.error("PromptGeneratorAgent failed: %s", str(e))
        return {"error": f"Prompt generator node failed: {str(e)}"}

# --- Node 3: Feedback Agent Node ---
def feedback_agent_node(state: AssetState) -> Dict:
    logger.info("FeedbackAgent: Reviewing story and image prompt (Iteration %d)", state.get('iterations', 0) + 1)
    client = get_genai_client()
    
    brand_colors_str = json.dumps(state.get('brand_colors', {}))
    personas_str = json.dumps(state.get('personas_info', []), indent=2)
    prev_assets_str = json.dumps(state.get('previous_assets_info', []), indent=2)
    
    prompt = f"""
    You are an elite QA and feedback agent. Your job is to review the storytelling concept, the generated image prompt, and the caption, and evaluate them against the campaign requirements and brand guidelines.
    
    Workspace Brand Guidelines:
    - Core Mission: {state.get('brand_core_mission')}
    - Target Audience: {state.get('brand_target_audience')}
    - Personality Traits: {state.get('brand_personality_traits')}
    - Brand Colors: {brand_colors_str}
    
    Campaign Context:
    - Strategy Objective: {state.get('strategy_objective')}
    - Campaign Notes/Purpose: {state.get('campaign_purpose')}
    - Personas:
    {personas_str}
    - Previous generated assets:
    {prev_assets_str}
    
    Drafts under review:
    - Story Concept:
    \"{state.get('story')}\"
    - Generated Image Prompt:
    \"{state.get('image_prompt')}\"
    - Generated Caption:
    \"{state.get('caption')}\"
    
    Evaluation Criteria:
    1. Align with Strategy: Does the story concept effectively convey the campaign objective and target the personas?
    2. Visual Aesthetic: Is the image prompt descriptive, modern, and does it represent a premium SaaS aesthetic (no text, no logos)?
    3. Colors: Does the prompt include and naturally weave in the brand colors?
    4. Uniqueness: Is the visual concept distinct from the previous 10 generated assets?
    
    You MUST provide detailed self-improvement feedback for any failures.
    You MUST respond in raw JSON format matching this schema:
    {{
        "approved": true,
        "story_feedback": "Detailed constructive feedback for the Story Agent. Empty if the story is approved.",
        "prompt_feedback": "Detailed constructive feedback for the Prompt Generator Agent. Empty if the prompt is approved."
    }}
    Note: approved should only be true if BOTH story and prompt evaluation pass completely.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )
        data = json.loads(response.text)
        approved = data.get("approved", False)
        story_fb = data.get("story_feedback", "")
        prompt_fb = data.get("prompt_feedback", "")
        
        logger.info("FeedbackAgent: Review complete. Approved: %s\nStory Feedback: %s\nPrompt Feedback: %s", 
                    approved, story_fb or "None", prompt_fb or "None")
        
        new_iterations = state.get("iterations", 0) + 1
        
        return {
            "approved": approved,
            "story_feedback": story_fb if not approved else None,
            "prompt_feedback": prompt_fb if not approved else None,
            "iterations": new_iterations
        }
    except Exception as e:
        logger.error("FeedbackAgent failed: %s", str(e))
        return {"error": f"Feedback agent node failed: {str(e)}"}

# --- Node 4: Image Generator Node ---
def image_generator_node(state: AssetState) -> Dict:
    if state.get("error"):
        return {}

    logger.info("ImageGeneratorAgent: Generating image asset using gemini-2.5-flash-image via generate_content.")
    client = get_genai_client()
    
    # Determine the best aspect ratio based on targeted platform
    platform_lower = state['platform'].lower()
    if platform_lower == 'tiktok':
        aspect_ratio = "9:16"
    elif platform_lower == 'instagram':
        aspect_ratio = "1:1"
    else:
        aspect_ratio = "4:3" # standard landscape for LinkedIn/other

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-image',
            contents=state['image_prompt'],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio
                )
            )
        )
        
        image_bytes = None
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    image_bytes = part.inline_data.data
                    break
                    
        if not image_bytes:
            raise Exception("No image bytes found in generate_content response candidates.")

        logger.info("ImageGeneratorAgent: Successfully generated %d bytes of image data.", len(image_bytes))
        return {"image_bytes": image_bytes}
    except Exception as e:
        logger.error("ImageGeneratorAgent failed: %s", str(e))
        return {"error": f"Image generator node failed: {str(e)}"}

# --- Node 5: Uploader Node ---
def uploader_node(state: AssetState) -> Dict:
    if state.get("error"):
        return {}

    campaign_id = state['campaign_id']
    platform = state['platform']
    image_bytes = state['image_bytes']
    caption = state.get('caption', '')
    
    asset_id = str(uuid.uuid4())
    logger.info("UploaderAgent: Starting upload of asset '%s' to Supabase Storage.", asset_id)

    # 1. Upload to Supabase Storage S3/REST API
    upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/assets/{campaign_id}/{asset_id}.jpg"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
        "Content-Type": "image/jpeg"
    }

    try:
        response = requests.post(upload_url, headers=headers, data=image_bytes)
        if response.status_code not in (200, 201):
            raise Exception(f"Supabase upload failed with status {response.status_code}: {response.text}")
        
        # 2. Construct public URL
        media_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/assets/{campaign_id}/{asset_id}.jpg"
        logger.info("UploaderAgent: Upload complete. Public URL: %s", media_url)

        # 3. Save record in database
        db_asset_id = DatabaseService.insert_asset(
            campaign_id=campaign_id,
            platform=platform,
            asset_type="image",
            media_url=media_url,
            caption=caption,
            status="approved",
            notes=f"Generated via gemini prompt: {state.get('image_prompt')}"
        )
        logger.info("UploaderAgent: Saved asset record in DB with ID '%s'.", db_asset_id)
        
        return {
            "asset_id": db_asset_id,
            "media_url": media_url
        }
    except Exception as e:
        logger.error("UploaderAgent failed: %s", str(e))
        return {"error": f"Uploader node failed: {str(e)}"}

# --- Conditional routing function ---
def should_continue(state: AssetState) -> str:
    if state.get("error"):
        logger.warning("Routing to END due to error: %s", state["error"])
        return END
        
    approved = state.get("approved", False)
    iterations = state.get("iterations", 0)
    
    if approved:
        logger.info("should_continue: FeedbackAgent approved the prompt. Routing to 'image_generator'.")
        return "image_generator"
        
    if iterations >= 3:
        logger.warning("should_continue: FeedbackAgent disapproved, but reached max iterations (%d). Routing to 'image_generator' with current prompt.", iterations)
        return "image_generator"
        
    story_fb = state.get("story_feedback")
    prompt_fb = state.get("prompt_feedback")
    
    if story_fb:
        logger.info("should_continue: Story needs refinement. Routing back to 'story_agent' (Iteration %d/3).", iterations)
        return "story_agent"
        
    if prompt_fb:
        logger.info("should_continue: Prompt needs refinement. Routing back to 'prompt_generator' (Iteration %d/3).", iterations)
        return "prompt_generator"
        
    logger.info("should_continue: Routing back to 'story_agent' for general refinement.")
    return "story_agent"

# --- Workflow runner ---
class AssetGeneratorService:
    @classmethod
    def generate_asset_workflow(cls, workspace_id: str, campaign_id: str, platform: str) -> Dict:
        logger.info("AssetGeneratorService: Initializing multi-agent asset generation for campaign '%s', platform '%s'", campaign_id, platform)
        
        # 1. Load context from database
        try:
            brand = DatabaseService.get_brand(workspace_id)
            strategy = DatabaseService.get_strategy(campaign_id)
            personas = DatabaseService.get_personas(campaign_id)
            campaign_context = DatabaseService.get_campaign_notes_and_previous_assets(campaign_id)
        except Exception as e:
            logger.error("Failed to load context from database: %s", str(e))
            return {"error": f"Database fetch failed: {str(e)}"}

        # 2. Build StateGraph
        builder = StateGraph(AssetState)
        builder.add_node("story_agent", story_agent_node)
        builder.add_node("prompt_generator", prompt_generator_node)
        builder.add_node("feedback_agent", feedback_agent_node)
        builder.add_node("image_generator", image_generator_node)
        builder.add_node("uploader", uploader_node)

        # Connect edges
        builder.add_edge(START, "story_agent")
        builder.add_edge("story_agent", "prompt_generator")
        builder.add_edge("prompt_generator", "feedback_agent")
        
        # Feedback loop routing
        builder.add_conditional_edges(
            "feedback_agent",
            should_continue,
            {
                "story_agent": "story_agent",
                "prompt_generator": "prompt_generator",
                "image_generator": "image_generator",
                END: END
            }
        )
        
        builder.add_edge("image_generator", "uploader")
        builder.add_edge("uploader", END)

        graph = builder.compile()

        # 3. Initialize state parameters
        initial_state = AssetState(
            workspace_id=workspace_id,
            campaign_id=campaign_id,
            platform=platform,
            brand_core_mission=brand.get("core_mission"),
            brand_target_audience=brand.get("target_audience"),
            brand_personality_traits=brand.get("personality_traits"),
            brand_colors=brand.get("brand_colors", {}),
            strategy_objective=strategy.get("objective"),
            personas_info=personas,
            
            # Context fields
            campaign_purpose=campaign_context.get("purpose"),
            previous_assets_info=campaign_context.get("previous_assets", []),
            
            # Agent state defaults
            story=None,
            story_feedback=None,
            image_prompt=None,
            caption=None,
            prompt_feedback=None,
            approved=False,
            iterations=0,
            image_bytes=None,
            media_url=None,
            asset_id=None,
            error=None
        )

        # 4. Execute workflow
        logger.info("AssetGeneratorService: Executing multi-agent state graph workflow.")
        result = graph.invoke(initial_state)

        if result.get("error"):
            logger.error("AssetGeneratorService: Workflow completed with error: %s", result["error"])
        else:
            logger.info("AssetGeneratorService: Workflow completed successfully. Created Asset ID: %s", result.get("asset_id"))

        return result
