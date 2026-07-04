from services.play_scraper_service import collect_merchant_reviews

print("Fetching 1 review from each app...")
reviews = collect_merchant_reviews(count_per_app=1)
for r in reviews:
    print(f"\n--- {r['competitor']} (Rating: {r['rating']}) ---")
    print(r['content'])
