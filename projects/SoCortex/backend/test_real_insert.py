import os
from supabase import create_client, Client
from google import genai
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = genai.Client(api_key=GEMINI_API_KEY)

response = client.models.embed_content(
    model='gemini-embedding-2',
    contents='test real insert',
)
embedding = response.embeddings[0].values

try:
    res = supabase.table("documents").insert({
        "content": "test real insert",
        "metadata": {"test": True},
        "embedding": embedding
    }).execute()
    print("Insert response:", len(res.data))
except Exception as e:
    print("Error:", e)
