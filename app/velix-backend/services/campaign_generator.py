import json
import logging
from typing import TypedDict, List, Dict, Optional
from google import genai
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from config import settings
from services.database import DatabaseService

# Initialize logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("campaign_generator")

# --- schemas for structured output ---

class SinglePersona(BaseModel):
    name: str = Field(description="Full name of the persona (e.g. Creator Chloe, Tech Lead Tom)")
    role: str = Field(description="Current professional or personal role (e.g. Indie Hacker, Marketing Lead)")
    demographics: dict = Field(description="A dictionary of demographic traits, e.g. {'age': 28, 'location': 'New York', 'income': '$80k'}")
    motivations: List[str] = Field(description="List of 3-5 core motivations/goals related to the product/campaign")
    pain_points: List[str] = Field(description="List of 3-5 core pain points/challenges they face")

class PersonasDraft(BaseModel):
    personas: List[SinglePersona] = Field(description="List of exactly 3 distinct target personas")

class StrategyDraft(BaseModel):
    objective: str = Field(description="The primary objective of the campaign (e.g. increase click-through-rates, sign up new developers)")
    kpis: List[dict] = Field(description="A list of 3-5 measurable key performance indicators, e.g. [{'metric': 'CTR', 'target': '3.5%', 'source': 'Google Analytics'}]")

class FeedbackSchema(BaseModel):
    critique: str = Field(description="Feedback detailing any misalignments, missing details, or required changes")
    is_approved: bool = Field(description="True if both personas and strategy are completely aligned with brand, platforms, and purpose; False if edits are needed")


# --- State definition ---

class CampaignState(TypedDict):
    workspace_id: str
    campaign_name: str
    targeted_platform: List[str]
    purpose: str
    brand_core_mission: Optional[str]
    brand_target_audience: Optional[str]
    brand_personality_traits: Optional[List[str]]
    brand_competitor: Optional[Dict]
    research_report: Optional[str]
    draft_personas: Optional[List[Dict]]
    draft_strategy: Optional[Dict]
    feedback: Optional[str]
    iterations: int
    is_approved: bool
    campaign_id: Optional[str]
    error: Optional[str]


# --- LLM Client initialization ---

def get_genai_client():
    return genai.Client(
        vertexai=True,
        project=settings.GOOGLE_PROJECT_ID or None,
        location=settings.GOOGLE_LOCATION
    )


# --- Node implementations ---

def researcher_node(state: CampaignState) -> Dict:
    logger.info("ResearcherAgent: Starting target market research for campaign '%s'", state.get('campaign_name'))
    client = get_genai_client()
    
    prompt = f"""
    You are a premium market researcher agent. Analyze the campaign details and the workspace's brand profile to produce a detailed target market research report.
    
    Workspace Brand Context:
    - Core Mission: {state.get('brand_core_mission')}
    - Target Audience: {state.get('brand_target_audience')}
    - Personality Traits: {state.get('brand_personality_traits')}
    - Competitor Profile: {state.get('brand_competitor')}
    
    Campaign Details:
    - Name: {state.get('campaign_name')}
    - Purpose: {state.get('purpose')}
    - Targeted Platforms: {', '.join(state.get('targeted_platform', []))}
    
    Tasks:
    1. Detail how the target platforms (e.g. Instagram/LinkedIn) affect content structure and viewer engagement for this campaign.
    2. Propose key messaging angles and value hooks based on the brand's core mission.
    3. Outline strategies to counter the specified competitor.
    
    Format the output as a clean, detailed markdown document.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        logger.info("ResearcherAgent: Successfully generated research report.\nReport:\n%s", response.text)
        return {"research_report": response.text}
    except Exception as e:
        logger.error("ResearcherAgent failed: %s", str(e))
        return {"error": f"Researcher node failed: {str(e)}"}


def creator_fork_node(state: CampaignState) -> Dict:
    logger.info("CreatorForkNode: Branching into parallel Persona and Strategy creator tasks.")
    # Dummy node that acts as a router branching point
    return {}


def persona_creator_node(state: CampaignState) -> Dict:
    if state.get("error"):
        return {}
        
    logger.info("PersonaCreatorAgent: Generating personas for campaign '%s'. Iteration: %d", state.get('campaign_name'), state.get('iterations', 0))
    client = get_genai_client()
    
    prompt = f"""
    You are a creative target persona generator. Draft exactly 3 distinct user personas for the marketing campaign based on the provided research report.
    
    Research Report:
    \"\"\"
    {state.get('research_report')}
    \"\"\"
    
    Brand Details:
    - Core Mission: {state.get('brand_core_mission')}
    - Target Audience: {state.get('brand_target_audience')}
    - Personality: {state.get('brand_personality_traits')}
    
    Campaign Settings:
    - Name: {state.get('campaign_name')}
    - Platforms: {', '.join(state.get('targeted_platform', []))}
    - Purpose: {state.get('purpose')}
    """
    
    if state.get("feedback"):
        prompt += f"\n\nIMPORTANT: You must address the following feedback from the editor:\nFeedback: {state.get('feedback')}"
        
    prompt += "\n\nProvide the 3 personas structured exactly matching the requested schema."
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": PersonasDraft
            }
        )
        draft: PersonasDraft = response.parsed
        # Convert Pydantic objects to dicts
        personas_list = []
        for p in draft.personas:
            personas_list.append({
                "name": p.name,
                "role": p.role,
                "demographics": p.demographics,
                "motivations": p.motivations,
                "pain_points": p.pain_points
            })
        logger.info("PersonaCreatorAgent: Successfully generated 3 personas.\nPersonas:\n%s", json.dumps(personas_list, indent=2))
        return {"draft_personas": personas_list}
    except Exception as e:
        logger.error("PersonaCreatorAgent failed: %s", str(e))
        return {"error": f"Persona creator node failed: {str(e)}"}


def strategy_creator_node(state: CampaignState) -> Dict:
    if state.get("error"):
        return {}
        
    logger.info("StrategyCreatorAgent: Generating strategy for campaign '%s'. Iteration: %d", state.get('campaign_name'), state.get('iterations', 0))
    client = get_genai_client()
    
    prompt = f"""
    You are a digital marketing strategist. Generate a campaign objective and 3-5 measurable key performance indicators (KPIs) based on the research report.
    
    Research Report:
    \"\"\"
    {state.get('research_report')}
    \"\"\"
    
    Brand Details:
    - Core Mission: {state.get('brand_core_mission')}
    - Competitor: {state.get('brand_competitor')}
    
    Campaign Settings:
    - Name: {state.get('campaign_name')}
    - Platforms: {', '.join(state.get('targeted_platform', []))}
    - Purpose: {state.get('purpose')}
    """
    
    if state.get("feedback"):
        prompt += f"\n\nIMPORTANT: You must address the following feedback from the editor:\nFeedback: {state.get('feedback')}"
        
    prompt += "\n\nProvide the strategy structured exactly matching the requested schema."
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": StrategyDraft
            }
        )
        draft: StrategyDraft = response.parsed
        strategy_data = {
            "objective": draft.objective,
            "kpis": draft.kpis
        }
        logger.info("StrategyCreatorAgent: Successfully generated strategy.\nStrategy:\n%s", json.dumps(strategy_data, indent=2))
        return {
            "draft_strategy": strategy_data
        }
    except Exception as e:
        logger.error("StrategyCreatorAgent failed: %s", str(e))
        return {"error": f"Strategy creator node failed: {str(e)}"}


def feedback_node(state: CampaignState) -> Dict:
    if state.get("error"):
        return {}
        
    logger.info("FeedbackAgent: Reviewing generated personas and strategy. Current iteration: %d", state.get('iterations', 0) + 1)
    client = get_genai_client()
    
    prompt = f"""
    You are a marketing director acting as a feedback/editor agent. Evaluate the generated personas and campaign strategy for alignment, depth, and platform fitness.
    
    Campaign Context:
    - Platforms: {', '.join(state.get('targeted_platform', []))}
    - Purpose: {state.get('purpose')}
    - Brand Target Audience: {state.get('brand_target_audience')}
    
    Generated Personas:
    {json.dumps(state.get('draft_personas', []), indent=2)}
    
    Generated Strategy:
    {json.dumps(state.get('draft_strategy', {}), indent=2)}
    
    Tasks:
    1. Check if the strategy objective and target KPIs are realistic and directly address the campaign purpose ({state.get('purpose')}).
    2. Check if the target personas make sense for the brand's space and the campaign platforms ({', '.join(state.get('targeted_platform', []))}). E.g. if Instagram, do the personas capture content consumption behaviors?
    
    Provide the feedback structured exactly matching the requested schema.
    If they are good, set is_approved to True. If adjustments are needed, set is_approved to False and provide suggestions.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": FeedbackSchema
            }
        )
        feedback_res: FeedbackSchema = response.parsed
        feedback_dict = {
            "critique": feedback_res.critique,
            "is_approved": feedback_res.is_approved
        }
        logger.info("FeedbackAgent Response:\n%s", json.dumps(feedback_dict, indent=2))
        
        if feedback_res.is_approved:
            logger.info("FeedbackAgent: Generated assets APPROVED.")
        else:
            logger.warning("FeedbackAgent: Generated assets REJECTED. Critique: %s", feedback_res.critique)
            
        return {
            "feedback": feedback_res.critique if not feedback_res.is_approved else None,
            "is_approved": feedback_res.is_approved,
            "iterations": state.get("iterations", 0) + 1
        }
    except Exception as e:
        logger.error("FeedbackAgent failed: %s", str(e))
        return {"error": f"Feedback node failed: {str(e)}"}


def db_save_node(state: CampaignState) -> Dict:
    if state.get("error"):
        return {}
        
    logger.info("SaveAgent: Storing campaign, strategy, and personas to database.")
    try:
        campaign_id = DatabaseService.create_campaign_transaction(
            workspace_id=state["workspace_id"],
            name=state["campaign_name"],
            targeted_platforms=state["targeted_platform"],
            purpose=state["purpose"],
            strategy=state["draft_strategy"],
            personas=state["draft_personas"]
        )
        logger.info("SaveAgent: Successfully committed campaign data. Generated campaign ID: %s", campaign_id)
        return {"campaign_id": campaign_id}
    except Exception as e:
        logger.error("SaveAgent failed: %s", str(e))
        return {"error": f"Database save node transaction failed: {str(e)}"}


# --- Graph Setup ---

def build_campaign_graph():
    builder = StateGraph(CampaignState)
    
    # Register nodes
    builder.add_node("researcher", researcher_node)
    builder.add_node("creator_fork", creator_fork_node)
    builder.add_node("persona_creator", persona_creator_node)
    builder.add_node("strategy_creator", strategy_creator_node)
    builder.add_node("feedback", feedback_node)
    builder.add_node("save", db_save_node)
    
    # Define execution paths
    builder.add_edge(START, "researcher")
    builder.add_edge("researcher", "creator_fork")
    
    # Split execution in parallel
    builder.add_edge("creator_fork", "persona_creator")
    builder.add_edge("creator_fork", "strategy_creator")
    
    # Merge both creator nodes into the feedback node
    builder.add_edge("persona_creator", "feedback")
    builder.add_edge("strategy_creator", "feedback")
    
    # Conditional routing after feedback
    def route_after_feedback(state: CampaignState):
        if state.get("error"):
            return END
        if state.get("is_approved") or state.get("iterations", 0) >= 3:
            return "save"
        return "retry"
        
    builder.add_conditional_edges(
        "feedback",
        route_after_feedback,
        {
            "save": "save",
            "retry": "creator_fork", # loop back to parallel creators
            END: END
        }
    )
    
    builder.add_edge("save", END)
    
    return builder.compile()


class CampaignGeneratorService:
    @staticmethod
    def generate_campaign_with_assets(
        workspace_id: str,
        name: str,
        targeted_platform: List[str],
        purpose: str
    ) -> str:
        # 1. Fetch brand details for the workspace
        brand = DatabaseService.get_brand(workspace_id)
        if not brand:
            raise Exception(f"No brand profile found for workspace ID {workspace_id}. Please configure brand first.")
            
        # 2. Build initial state
        initial_state: CampaignState = {
            "workspace_id": workspace_id,
            "campaign_name": name,
            "targeted_platform": targeted_platform,
            "purpose": purpose,
            "brand_core_mission": brand.get("core_mission"),
            "brand_target_audience": brand.get("target_audience"),
            "brand_personality_traits": brand.get("personality_traits"),
            "brand_competitor": brand.get("competitor"),
            "research_report": None,
            "draft_personas": None,
            "draft_strategy": None,
            "feedback": None,
            "iterations": 0,
            "is_approved": False,
            "campaign_id": None,
            "error": None
        }
        
        # 3. Execute LangGraph flow
        graph = build_campaign_graph()
        result_state = graph.invoke(initial_state)
        
        # 4. Handle errors and return campaign ID
        if result_state.get("error"):
            raise Exception(result_state["error"])
            
        campaign_id = result_state.get("campaign_id")
        if not campaign_id:
            raise Exception("Workflow completed but no campaign ID was generated.")
            
        return campaign_id
