-- Drop existing if re-running
drop function if exists match_documents;
drop table if exists documents;

-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,          -- The chunked markdown text
  metadata jsonb,                 -- Store project name, file name, section title, etc.
  embedding vector(3072)          -- Gemini gemini-embedding-2 outputs 3072 dimensions
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
