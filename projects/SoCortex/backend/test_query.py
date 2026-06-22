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
    contents="Which projects used PostgreSQL?",
)
embedding = response.embeddings[0].values

response = supabase.rpc(
    'match_documents',
    {
        'query_embedding': embedding,
        'match_threshold': -2.0,
        'match_count': 5
    }
).execute()

print("Returned Docs:", len(response.data))
if response.data:
    for doc in response.data:
         print(doc['metadata'], doc['similarity'])
