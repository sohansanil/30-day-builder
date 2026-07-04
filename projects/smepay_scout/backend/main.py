from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.play_scraper_service import collect_merchant_reviews, format_reviews_for_ai
from services.ai_service import analyze
import datetime

app = FastAPI(title="SMEPay Intelligence Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    max_reviews_per_app: int = 50

@app.post("/analyze")
async def run_analysis(req: AnalyzeRequest):
    """
    Single endpoint. Does everything:
    1. Collects Google Play Store reviews
    2. Builds Market Context
    3. Sends to Gemini 1.5 Pro
    4. Returns structured JSON
    """
    try:
        reviews = collect_merchant_reviews(count_per_app=req.max_reviews_per_app)

        if len(reviews) == 0:
            raise HTTPException(
                status_code=503,
                detail="No reviews collected. Scraper may have failed."
            )

        context = format_reviews_for_ai(reviews)
        analysis_result = analyze(context)

        # Attach the raw reviews so the frontend can display them for credibility
        analysis_result["raw_reviews"] = reviews
        
        analysis_result["_meta"] = {
            "reviews_analyzed": len(reviews),
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "model_used": "gemini-1.5-pro"
        }
        return analysis_result

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"[Main] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed. Check server logs.")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/reviews/recent")
async def get_recent_reviews(count_per_app: int = 3):
    """Fetches the absolute latest raw reviews directly from Play Store without AI analysis."""
    try:
        reviews = collect_merchant_reviews(count_per_app=count_per_app)
        return {"reviews": reviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {e}")
