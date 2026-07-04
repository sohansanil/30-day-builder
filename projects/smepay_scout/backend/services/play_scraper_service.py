from google_play_scraper import reviews, Sort
from typing import List, Dict

COMPETITORS = {
    "BharatPe": "com.bharatpe.app",
    "PhonePe Business": "com.phonepe.app.business",
    "Paytm Business": "com.paytm.business"
}

def collect_merchant_reviews(count_per_app: int = 50) -> List[Dict]:
    """
    Collects recent reviews for major Indian merchant payment apps from the Google Play Store.
    This creates an authentic "Merchant Voice Dataset" without requiring any API keys.
    """
    print(f"\n[Play Store] Starting collection of {count_per_app} reviews per competitor...")
    all_reviews = []
    
    for name, package in COMPETITORS.items():
        try:
            print(f"[Play Store] Fetching reviews for {name}...")
            # Fetch reviews, sorted by NEWEST to get current grievances
            result, _ = reviews(
                package,
                lang='en',
                country='in',
                sort=Sort.NEWEST,
                count=count_per_app
            )
            
            # Filter and structure the reviews
            for r in result:
                # We only care about reviews with text, preferably 1 or 2 stars for pain points
                # but we'll take all to let the AI summarize market mood.
                if r['content']:
                    all_reviews.append({
                        "competitor": name,
                        "rating": r['score'],
                        "content": r['content'],
                        "date": r['at'].strftime("%Y-%m-%d")
                    })
                    
            print(f"✅ Extracted {len(result)} text reviews for {name}.")
            
        except Exception as e:
            print(f"❌ Error fetching reviews for {name}: {e}")
            
    return all_reviews

def format_reviews_for_ai(reviews: List[Dict]) -> str:
    """Formats the collected reviews into a structured string for the AI prompt."""
    if not reviews:
        return "No merchant reviews found."
        
    formatted = "--- MERCHANT VOICE DATASET (GOOGLE PLAY STORE REVIEWS) ---\n\n"
    for r in reviews:
        formatted += f"[{r['competitor']}] Rating: {r['rating']}/5\n"
        formatted += f"Review: {r['content']}\n"
        formatted += "-" * 40 + "\n"
        
    return formatted
