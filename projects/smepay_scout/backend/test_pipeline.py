import asyncio
import json
from services.play_scraper_service import collect_merchant_reviews, format_reviews_for_ai
from services.ai_service import analyze

def run_test():
    print("🚀 Starting SMEPay Scout Intelligence Pipeline Verification...\n")
    
    # 1. Fetch Google Play Reviews
    print("[1/3] Collecting Google Play Store Reviews...")
    reviews = collect_merchant_reviews(count_per_app=30) # Fetch 30 per app for speed
    print(f"✅ Collected {len(reviews)} reviews.")
    
    # 2. Analyze with Gemini
    print("\n[2/3] Passing to Market Context Builder & Gemini 3.1 Pro Preview...")
    
    # Format reviews directly as the context
    context = format_reviews_for_ai(reviews)
    result = analyze(context)
    print("✅ Analysis complete.")
    
    # 3. Output
    print("\n[3/3] Intelligence Output:")
    print("="*60)
    print(json.dumps(result, indent=2))
    print("="*60)

if __name__ == "__main__":
    run_test()
