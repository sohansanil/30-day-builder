import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai
from google.genai import types

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not GEMINI_API_KEY:
    raise RuntimeError("Missing environment variables. Check .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="SoCortex Backend")

# Allow all origins for MVP. In production, restrict this to the Vercel domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str

class PlacementRequest(BaseModel):
    job_description: str

def get_embedding(text: str) -> list[float]:
    try:
        response = client.models.embed_content(
            model='gemini-embedding-2',
            contents=text,
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Embedding error: {e}")
        return []

def retrieve_context(query_embedding: list[float], match_count: int = 5):
    try:
        response = supabase.rpc(
            'match_documents',
            {
                'query_embedding': query_embedding,
                'match_threshold': 0.0,
                'match_count': match_count
            }
        ).execute()
        return response.data
    except Exception as e:
        print(f"Supabase RPC error: {e}")
        return []

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    embedding = get_embedding(req.query)
    if not embedding:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")
        
    documents = retrieve_context(embedding, match_count=15)
    
    if not documents:
        return {
            "answer": "I couldn't find any relevant information in your projects to answer that.",
            "sources": []
        }
        
    context_text = "\n\n---\n\n".join(
        [f"Project: {doc['metadata']['project']}\nFile: {doc['metadata']['filename']}\nContent:\n{doc['content']}" 
         for doc in documents]
    )
    
    prompt = f"""You are SoCortex, the personal AI assistant for Sohan's 30-Day Builder journey.
You answer questions based ONLY on the following context retrieved from Sohan's codebase and resume.
If the answer is not in the context, politely say you don't know based on the indexed projects.

CRITICAL FORMATTING RULES:
Never output a wall of text. 
Transform all answers into structured, dashboard-like summaries using Markdown.
- Use `##` for main sections or project names (e.g., ## AniMatch)
- Use `###` for metadata categories (e.g., ### Problem, ### Stack, ### Key Lesson)
- Keep descriptions extremely concise. Use bullet points (`- `) where possible.
- If comparing projects, create a distinct section for each project, then a final `## Evolution` or `## Conclusion` section.
- Write like a generated dashboard, not an essay.

Context:
{context_text}

Question: {req.query}
"""

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    
    sources = [
        {
            "project": doc['metadata']['project'],
            "filename": doc['metadata']['filename'],
            "similarity": round(doc['similarity'] * 100, 1),
            "content": doc['content'][:150] + "..." # Snippet
        } for doc in documents
    ]
    
    # Deduplicate sources by project + filename
    unique_sources = []
    seen = set()
    for s in sources:
        key = f"{s['project']}-{s['filename']}"
        if key not in seen:
            seen.add(key)
            unique_sources.append(s)
            
    return {
        "answer": response.text,
        "sources": unique_sources
    }

@app.post("/api/placement")
async def placement_endpoint(req: PlacementRequest):
    embedding = get_embedding(req.job_description)
    if not embedding:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")
        
    # Retrieve more context for JD matching
    documents = retrieve_context(embedding, match_count=10)
    
    if not documents:
        raise HTTPException(status_code=404, detail="No matching projects found.")
        
    context_text = "\n\n---\n\n".join(
        [f"Project: {doc['metadata']['project']}\nContent:\n{doc['content']}" 
         for doc in documents]
    )
    
    prompt = f"""You are SoCortex, an Interview Copilot. 
Analyze the provided Job Description and match it against the retrieved context from Sohan's past projects.

Your output MUST be in valid JSON format exactly matching this structure:
{{
  "jd_analysis": "A brief 2-sentence summary of what this role is looking for.",
  "core_skills": ["Skill 1", "Skill 2", "Skill 3"],
  "matched_projects": [
    {{
      "project_name": "Project Name",
      "relevance_explanation": "Why this project perfectly demonstrates the skills needed for this role."
    }}
  ],
  "missing_skills": ["Skill A", "Skill B"]
}}

Job Description:
{req.job_description}

Retrieved Projects Context:
{context_text}
"""

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    
    try:
        import json
        result = json.loads(response.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse Gemini JSON output")
