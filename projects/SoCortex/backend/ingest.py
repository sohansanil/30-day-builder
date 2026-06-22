import os
import json
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai

# Load environment variables
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not GEMINI_API_KEY:
    print("❌ Missing environment variables. Please check your .env file.")
    exit(1)

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = genai.Client(api_key=GEMINI_API_KEY)

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent

# Files we want to index
TARGET_FILES = ["README.md", "ARCHITECTURE.md", "INTERVIEW_PREP.md", "context.md"]

def chunk_text(text: str, chunk_size: int = 1500, overlap: int = 200):
    """Extremely simple chunking strategy. Splits by paragraphs, then chunks."""
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for p in paragraphs:
        if len(current_chunk) + len(p) < chunk_size:
            current_chunk += p + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = p + "\n\n"
            
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks

def get_embedding(text: str) -> list[float]:
    """Get embedding from Gemini."""
    try:
        response = client.models.embed_content(
            model='gemini-embedding-2',
            contents=text,
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return []

def process_file(file_path: Path, project_name: str):
    print(f"\nProcessing {file_path.name} in project {project_name}...")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Failed to read {file_path}: {e}")
        return

    chunks = chunk_text(content)
    print(f"Generated {len(chunks)} chunks.")

    for i, chunk in enumerate(chunks):
        if not chunk.strip():
            continue
            
        embedding = get_embedding(chunk)
        if not embedding:
            continue
            
        metadata = {
            "project": project_name,
            "filename": file_path.name,
            "chunk_index": i
        }
        
        try:
            # Upsert into Supabase
            supabase.table("documents").insert({
                "content": chunk,
                "metadata": metadata,
                "embedding": embedding
            }).execute()
            print(f"✅ Upserted chunk {i+1}/{len(chunks)}")
        except Exception as e:
            print(f"❌ Failed to upsert chunk {i+1}: {e}")

def main():
    print("🗑️ Clearing old documents from Supabase...")
    try:
        # Delete all rows (requires RLS to allow this or using service role, but anon key works if no RLS)
        # A trick to delete all rows is deleting where id is not null
        supabase.table("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    except Exception as e:
        print(f"Warning: Could not clear old documents: {e}")

    print("🚀 Starting SoCortex Ingestion...")
    print(f"Scanning directory: {ROOT_DIR}")
    
    # 1. Ingest Resume
    resume_txt = ROOT_DIR / "resume.txt"
    resume_md = ROOT_DIR / "resume.md"
    
    if resume_txt.exists():
        process_file(resume_txt, "resume")
    elif resume_md.exists():
        process_file(resume_md, "resume")
    else:
        print("⚠️ No resume.txt or resume.md found in the root directory.")

    # 2. Ingest Projects
    projects_dir = ROOT_DIR / "projects"
    if projects_dir.exists():
        for project_path in projects_dir.iterdir():
            if project_path.is_dir() and project_path.name != "socortex":
                for target in TARGET_FILES:
                    target_path = project_path / target
                    if target_path.exists():
                        process_file(target_path, project_path.name)
    else:
        print("⚠️ Projects directory not found.")
        
    print("\n🎉 Ingestion complete!")

if __name__ == "__main__":
    main()
