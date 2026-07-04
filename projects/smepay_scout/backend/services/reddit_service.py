import praw
import os
from dotenv import load_dotenv

load_dotenv()

KEYWORDS = [
    "Razorpay merchant",
    "BharatPe business",
    "PhonePe for business",
    "Paytm merchant",
    "payment gateway India",
    "UPI settlement merchant",
    "merchant onboarding India",
    "POS machine India",
    "payment processing India startup",
    "merchant payments problem India",
]

SUBREDDITS = "IndiaFintech+india+startups+smallbusiness+entrepreneur"

def collect_posts(max_posts: int = 150, time_window: str = "month") -> list[dict]:
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "SMEPayIntel/1.0 by /u/your_reddit_username")

    if not client_id or not client_secret:
        print("[Reddit] Warning: Missing Reddit credentials. Returning mock data for verification.")
        return get_mock_posts()

    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
    )

    seen_ids = set()
    posts = []

    posts_per_keyword = max(1, max_posts // len(KEYWORDS))

    for keyword in KEYWORDS:
        if len(posts) >= max_posts:
            break

        try:
            results = reddit.subreddit(SUBREDDITS).search(
                keyword,
                time_filter=time_window,
                limit=posts_per_keyword,
                sort="relevance",
            )

            for submission in results:
                if submission.id in seen_ids or len(posts) >= max_posts:
                    break
                seen_ids.add(submission.id)

                # Grab top 5 comments by upvotes
                submission.comments.replace_more(limit=0)
                top_comments = sorted(
                    submission.comments.list(), key=lambda c: c.score, reverse=True
                )[:5]

                posts.append({
                    "id": submission.id,
                    "title": submission.title,
                    "body": (submission.selftext or "")[:500],
                    "subreddit": submission.subreddit.display_name,
                    "upvotes": submission.score,
                    "comments": [
                        {"text": c.body[:300], "upvotes": c.score}
                        for c in top_comments
                    ],
                })

        except Exception as e:
            print(f"[Reddit] Error for keyword '{keyword}': {e}")
            continue

    print(f"[Reddit] Collected {len(posts)} posts across {len(seen_ids)} unique IDs")
    return posts

def get_mock_posts():
    """Returns realistic mock data to verify the intelligence pipeline when Reddit keys are missing."""
    return [
        {
            "id": "mock1",
            "title": "Razorpay settlement delays are killing my cash flow",
            "body": "Is anyone else experiencing T+3 or even T+4 settlements with Razorpay recently? Support is completely unresponsive. As a small retailer, I can't afford to have my capital locked up like this. Thinking of switching to BharatPe.",
            "subreddit": "smallbusiness",
            "upvotes": 145,
            "comments": [
                {"text": "Same here. Razorpay support used to be good but now it's just bots. Took 5 days to resolve my last stuck settlement.", "upvotes": 56},
                {"text": "I switched to PhonePe business for this exact reason. Settlements are fast but their API documentation is a nightmare.", "upvotes": 34}
            ]
        },
        {
            "id": "mock2",
            "title": "BharatPe POS machine not working, terrible support",
            "body": "My BharatPe swipe machine has been down for 2 days. Lost so many customers because of it. Their merchant support number just rings and rings. Unacceptable.",
            "subreddit": "IndiaFintech",
            "upvotes": 89,
            "comments": [
                {"text": "BharatPe is only good for the 12% club, their merchant hardware is cheaply made.", "upvotes": 42},
                {"text": "Try Paytm's Soundbox and POS. Much more reliable hardware.", "upvotes": 21}
            ]
        },
        {
            "id": "mock3",
            "title": "Why does merchant onboarding take so long in India?",
            "body": "I'm trying to start a D2C brand. Applied for a payment gateway 2 weeks ago. Still stuck in KYC hell. They keep asking for physical documents when everything is digital now. Is there any gateway that actually onboards in 24 hours?",
            "subreddit": "startups",
            "upvotes": 210,
            "comments": [
                {"text": "Razorpay onboarding is usually fast but if you trigger a risk flag, you're stuck in limbo forever.", "upvotes": 88},
                {"text": "We need a Stripe equivalent in India that just works. The current players are too bureaucratic.", "upvotes": 65}
            ]
        },
        {
            "id": "mock4",
            "title": "Paytm Business app UI update is confusing",
            "body": "Since the last update, I can't find my daily settlement reports easily. They buried it under three menus. Also, GST reconciliation is still a manual nightmare. Why can't these apps just export a clean CSV for my CA?",
            "subreddit": "india",
            "upvotes": 112,
            "comments": [
                {"text": "Agreed. The analytics on Paytm are useless. I just want to know my net revenue after MDR fees without doing math.", "upvotes": 45},
                {"text": "If a payment gateway offered automated GST reports, I would switch immediately.", "upvotes": 78}
            ]
        },
        {
            "id": "mock5",
            "title": "PhonePe Business charging high MDR on credit cards",
            "body": "Noticed my margins dropping. Realized PhonePe is charging a premium MDR on certain corporate credit cards without notifying me. Is this standard practice?",
            "subreddit": "smallbusiness",
            "upvotes": 76,
            "comments": [
                {"text": "Hidden fees are standard in this industry. Always read the fine print.", "upvotes": 30},
                {"text": "Razorpay's pricing is at least transparent, even if it's on the higher side.", "upvotes": 25}
            ]
        }
    ]
