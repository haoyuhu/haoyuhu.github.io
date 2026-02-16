import os
import json
import asyncio
from typing import Literal, Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.genai import Client

# Initialize FastAPI
app = FastAPI(title="Portfolio Intelligence Agent")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
def get_ai_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found.")
        return None
    return Client(api_key=api_key)

# Configuration
GLOBAL_RECENT_LIMIT = 3  # k
TARGET_RECENT_LIMIT = 10 # p

def load_data():
    try:
        # Assuming server is run from root or backend/
        # We try both paths
        path = "public/data.json"
        if not os.path.exists(path):
            path = "../public/data.json"
        
        if not os.path.exists(path):
            return {}
            
        with open(path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading data: {e}")
        return {}

def find_relevant_articles(query, articles, limit=3):
    # Simple keyword matching on title and summary
    scores = []
    query_lower = query.lower()
    
    for article in articles:
        score = 0
        text = (article.get('title', '') + " " + article.get('summary', '')).lower()
        
        # Simple scoring
        words = query_lower.split()
        for word in words:
            if word in text:
                score += 1
        
        scores.append((score, article))
    
    # Sort by score desc
    scores.sort(key=lambda x: x[0], reverse=True)
    
    # Return top matches, filter out zero scores if we have enough matches
    relevant = [item[1] for item in scores if item[0] > 0]
    
    if not relevant:
        # If no keywords match, just return recent ones
        return articles[:limit]
        
    return relevant[:limit]

class ChatRequest(BaseModel):
    query: str
    target: Literal["info", "cv", "project", "article", "garden", "global"] = "global"
    verbose: bool = False

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    client = get_ai_client()
    if not client:
        raise HTTPException(status_code=503, detail="AI Service not configured")

    data = load_data()
    if not data:
        raise HTTPException(status_code=500, detail="Portfolio data not available")

    context = ""
    
    # Build Context
    if req.target in ["global", "info"]:
        context += f"## BASIC INFO\n{json.dumps(data.get('profile', {}), indent=2)}\n\n"
    
    if req.target in ["global", "cv"]:
        context += f"## EXPERIENCE\n{json.dumps(data.get('experience', []), indent=2)}\n"
        context += f"## EDUCATION\n{json.dumps(data.get('education', []), indent=2)}\n"
        context += f"## SKILLS\n{json.dumps(data.get('skills', []), indent=2)}\n\n"
    
    if req.target in ["global", "project"]:
        repos = data.get('repos', [])
        # Sort by stars
        repos.sort(key=lambda x: x.get('stars', 0), reverse=True)
        limit = 5 if req.target == "global" else 20
        context += f"## PROJECTS (Top {limit})\n{json.dumps(repos[:limit], indent=2)}\n\n"

    if req.target in ["global", "garden"]:
        notes = [p for p in data.get('blogs', []) if p.get('postType') == 'note']
        limit = GLOBAL_RECENT_LIMIT if req.target == "global" else TARGET_RECENT_LIMIT
        # Sort by date desc if available (assuming filename or date field)
        # For now just take list order (assuming recent first or appended)
        context += f"## GARDEN NOTES (Recent {limit})\n"
        for note in notes[:limit]:
            context += f"- Title: {note.get('title')}\n  Summary: {note.get('summary')}\n  Content: {note.get('content')[:500]}...\n\n"

    if req.target in ["global", "article"]:
        articles = [p for p in data.get('blogs', []) if p.get('postType') == 'article']
        
        if req.target == "global":
            # Just summaries for global
            context += f"## ARTICLES (Recent {GLOBAL_RECENT_LIMIT})\n"
            for art in articles[:GLOBAL_RECENT_LIMIT]:
                context += f"- Title: {art.get('title')}\n  Summary: {art.get('summary')}\n\n"
        else:
            # Targeted article search
            relevant = find_relevant_articles(req.query, articles)
            context += f"## RELEVANT ARTICLES\n"
            for art in relevant:
                context += f"### {art.get('title')}\n{art.get('content')}\n\n"

    system_instruction = f"""
    You are Haoyu Hu's interactive portfolio assistant (command: 'askme').
    
    ROLE:
    - You are helpful, professional, and slightly geeky.
    - Answer the user's question based STRICTLY on the provided context.
    - If the answer is not in the context, politely refuse or suggest checking another section (info/cv/project/article/garden).
    - Use Markdown formatting.
    - Be concise unless --verbose is requested (Current verbose mode: {req.verbose}).
    
    CONTEXT:
    {context}
    
    USER QUERY:
    {req.query}
    """

    async def response_stream():
        try:
            # Use streaming generation
            # Gemini 2.0 Flash Exp or configured model
            model_name = "gemini-2.0-flash-exp" 
            response = client.models.generate_content_stream(
                model=model_name,
                contents=system_instruction
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"Error generating response: {str(e)}"

    return StreamingResponse(response_stream(), media_type="text/plain")

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
