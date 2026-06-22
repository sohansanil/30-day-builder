import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
response = client.models.embed_content(
    model='gemini-embedding-2',
    contents='test',
)
print(len(response.embeddings[0].values))
