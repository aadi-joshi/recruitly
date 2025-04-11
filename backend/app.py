from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
import tempfile
import os
import shutil
from typing import List, Dict, Any
import json
import numpy as np
from pathlib import Path
import asyncio
from sentence_transformers import SentenceTransformer
import sqlite3

from jd_embedding_utils import generate_jd_embedding, extract_sections
from resume_embedding_utils import pdf_to_text, extract_resume_sections, generate_resume_embedding
from matcher import calculate_match_score, match_all_resumes
from email_utils import send_email
from agent_framework import AgentCoordinator

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect("recruitly.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            embedding TEXT,
            sections TEXT,
            summary TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            embedding TEXT,
            parsed TEXT,
            summary TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER,
            jd_id INTEGER,
            score REAL,
            reasoning TEXT,
            FOREIGN KEY (resume_id) REFERENCES resumes (id),
            FOREIGN KEY (jd_id) REFERENCES job_descriptions (id)
        )
    """)
    conn.commit()
    conn.close()

# Call init_db on startup
init_db()

# Classes for request/response models
class JDRequest(BaseModel):
    text: str

class MatchRequest(BaseModel):
    jd_sections: Dict[str, List[str]]
    resume_data: Dict[str, Dict[str, Any]]

class EmailRequest(BaseModel):
    email: str
    name: str
    subject: str
    body: str

class ScheduleRequest(BaseModel):
    candidate_id: str
    name: str
    email: str

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

# Store processed JD and resumes in memory for matching
current_session = {
    "jd": None,
    "resumes": {},
    "agent_coordinator": AgentCoordinator()
}

# ✅ Lazy-loaded model setup
model = None

@app.post("/embed")
def get_embedding(request: JDRequest):
    """Process a job description and generate its embedding"""
    global model
    if model is None:
        model = SentenceTransformer("all-MiniLM-L6-v2")

    coordinator = current_session["agent_coordinator"]
    result = coordinator.process_job_description(request.text)
    
    # Store in current session
    current_session["jd"] = result
    
    # Convert embedding dictionary properly for JSON response
    serializable_embedding = json.loads(
        json.dumps(result["embedding"], cls=NumpyEncoder)
    )
    
    response_data = {
        "title": result["title"],
        "embedding": serializable_embedding,
        "sections": result["sections"],
        "summary": result.get("summary", "")
    }
    
    return response_data

@app.post("/upload-resumes")
async def upload_resumes(files: List[UploadFile] = File(...)):
    """Process multiple resume PDFs and generate embeddings for each"""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Create temp directory for saving uploaded files
    with tempfile.TemporaryDirectory() as temp_dir:
        resume_results = {}
        
        # First save all files to disk to avoid keeping file handles open too long
        file_paths = []
        for file in files:
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append((file.filename, file_path))
        
        # Process files in batches to avoid memory issues
        batch_size = 3
        for i in range(0, len(file_paths), batch_size):
            batch = file_paths[i:i+batch_size]
            batch_tasks = []
            
            for filename, file_path in batch:
                batch_tasks.append(process_resume(filename, file_path))
            
            # Process each batch concurrently
            batch_results = await asyncio.gather(*batch_tasks)
            
            # Combine results
            for filename, result in batch_results:
                resume_results[filename] = result
                # Add to current session
                if "error" not in result:
                    current_session["resumes"][filename] = result
    
    # Convert NumPy arrays to lists for JSON response
    serializable_results = json.loads(
        json.dumps(resume_results, cls=NumpyEncoder)
    )
    
    return JSONResponse(content=serializable_results)

async def process_resume(filename, file_path):
    """Process a single resume PDF file"""
    try:
        coordinator = current_session["agent_coordinator"]
        result = coordinator.cv_agent.process_cv(file_path, filename)
        return filename, result
                
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")
        return filename, {"error": str(e)}

@app.post("/match")
def match_resumes():
    """Match the current JD with all processed resumes"""
    jd = current_session["jd"]
    resumes = current_session["resumes"]

    if not jd or not resumes:
        raise HTTPException(status_code=400, detail="Job description or resumes missing")

    jd_title = jd["title"]
    jd_embeddings = jd["embedding"]

    # Match all resumes
    all_candidates = match_all_resumes(jd_title, jd_embeddings, resumes, threshold=0.8)

    # Save all candidates to the database
    conn = sqlite3.connect("recruitly.db")
    cursor = conn.cursor()
    for candidate in all_candidates:
        cursor.execute("""
            INSERT INTO matches (resume_id, jd_id, score, reasoning)
            VALUES (?, ?, ?, ?)
        """, (candidate.get("resume_id"), jd.get("id"), candidate["score"], json.dumps(candidate["reasoning"])))
    conn.commit()
    conn.close()

    # Include all candidates in the response
    return {"candidates": all_candidates}

@app.post("/generate-interview-slots")
def generate_interview_slots():
    """Generate potential interview time slots"""
    if not current_session["agent_coordinator"]:
        raise HTTPException(status_code=400, detail="Agent coordinator not initialized")
    
    slots = current_session["agent_coordinator"].scheduler_agent.generate_interview_slots()
    
    return {"slots": slots}

@app.post("/prepare-interview-email/{candidate_id}")
def prepare_interview_email(candidate_id: str):
    """Prepare an interview email for a specific candidate"""
    if not current_session["jd"]:
        raise HTTPException(status_code=400, detail="No job description processed")
    
    # Find the candidate in the matches
    matched_candidates = []
    if "matches" in current_session:
        matched_candidates = current_session["matches"]["matches"]
    
    candidate = None
    for match in matched_candidates:
        if match["name"] == candidate_id or str(match.get("id", "")) == candidate_id:
            candidate = match
            break
    
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found")
    
    # Generate email content
    email_data = current_session["agent_coordinator"].scheduler_agent.prepare_email_for_candidate(
        candidate,
        current_session["jd"]["title"]
    )
    
    return email_data

@app.post("/send-email")
def send_candidate_email(request: EmailRequest):
    """Send an email to a candidate"""
    try:
        result = send_email(
            to_email=request.email,
            subject=request.subject,
            body=request.body
        )
        
        if result["success"]:
            return {"success": True, "message": f"Email sent to {request.name}"}
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggest-interview-times/{candidate_id}")
def suggest_interview_times(candidate_id: str):
    """Suggest available interview time slots for a candidate"""
    coordinator = current_session["agent_coordinator"]
    slots = coordinator.scheduler_agent.generate_interview_slots(days_ahead=7, slots_per_day=3)
    
    return {"candidate_id": candidate_id, "slots": slots}

# Helper function to extract name from parsed resume
def _extract_name(parsed, fallback):
    if "name" in parsed and parsed["name"] and len(parsed["name"]) > 0:
        return parsed["name"][0]
    return Path(fallback).stem

@app.get("/clear-session")
def clear_session():
    """Clear the current session data"""
    current_session["jd"] = None
    current_session["resumes"] = {}
    return {"message": "Session cleared"}

@app.get("/test-match")
def test_match():
    """Test endpoint to diagnose matching issues"""
    test_jd = """We are seeking an innovative and strategic Product Manager to lead the development and execution of new products. The ideal candidate will collaborate with cross-functional teams to define product roadmaps, analyze market trends, and ensure successful product launches. Responsibilities: Define product vision and strategy based on market research and customer needs. Work closely with engineering, design, and marketing teams to develop and launch products. Prioritize features, create roadmaps, and manage product lifecycle. Analyze user feedback and data to optimize product performance. Ensure alignment between business goals and product development. Qualifications: Bachelor's degree in Business, Computer Science, or a related field. Experience in product management, agile methodologies, and market research. Strong analytical, leadership, and communication skills. Familiarity with project management tools and data-driven decision-making."""
    
    # Process the test JD
    title, embedding = generate_jd_embedding(test_jd)
    sections = extract_sections(test_jd)
    
    # Create a simple test resume with matching sections
    test_resume = {
        "skills": ["Product management", "Agile methodologies", "Leadership"],
        "experience": ["5 years experience in product management", "Led cross-functional teams"],
        "education": ["Bachelor's degree in Computer Science"],
        "qualifications": ["Strong analytical skills", "Communication skills"]
    }
    
    # Run the matcher with debug output
    score, reasoning = calculate_match_score(sections, test_resume)
    
    return {
        "jd_sections": sections,
        "resume_sections": test_resume,
        "score": score,
        "reasoning": reasoning
    }

# Run the app locally
#if __name__ == "__main__":
    #import uvicorn
    #uvicorn.run(app, host="127.0.0.1", port=8000)
