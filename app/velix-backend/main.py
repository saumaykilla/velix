from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from services.crawler import CrawlerService
from services.analyzer import AnalyzerService
from services.database import DatabaseService

app = FastAPI(title="Velix Onboarding API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OnboardRequest(BaseModel):
    profile_id: str
    workspace_name: str
    website_url: str
    product_description: Optional[str] = ""

@app.post("/api/onboard", status_code=status.HTTP_201_CREATED)
async def onboard_user(request: OnboardRequest):
    try:
        # Step 1: Crawl the target website using Nimble
        scraped_content = "Scraping unavailable for this domain."
        style_info = None
        try:
            crawl_result = CrawlerService.extract_page_content(request.website_url)
            scraped_content = crawl_result.get("markdown", "")
            style_info = crawl_result.get("style_info", None)
            print("scraped content", scraped_content, '\n\n\n\n\n\n ')
            print("detected style info", style_info, '\n\n\n\n\n\n ')
        except Exception as e:
            # Fallback to user description only if scraping fails
            print(f"Warning: Website scraping failed: {str(e)}")

        # Step 2: Run Vertex AI Brand Analysis
        try:
            analysis = AnalyzerService.analyze_brand(
                scraped_content=scraped_content,
                user_description=request.product_description,
                style_info=style_info
            )
            print("analysis", analysis, '\n\n\n\n\n\n ')
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Vertex AI brand analysis failed: {str(e)}"
            )

        # Step 3: Insert Workspace and Brand inside a database transaction
        try:
            workspace_id = DatabaseService.create_workspace_and_brand(
                profile_id=request.profile_id,
                workspace_name=request.workspace_name,
                website_url=request.website_url,
                core_mission=analysis.core_mission,
                target_audience=analysis.target_audience,
                personality_traits=analysis.personality_traits,
                brand_colors=analysis.brand_colors.model_dump(),
                competitor=analysis.competitor.model_dump()
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database transaction failed: {str(e)}"
            )

        return {
            "status": "success",
            "workspace_id": workspace_id,
            "analysis": analysis
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
