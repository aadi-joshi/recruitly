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

from jd_embedding_utils import generate_jd_embedding, extract_sections
from resume_embedding_utils import pdf_to_text, extract_resume_sections, generate_resume_embedding
from matcher import calculate_match_score, match_all_resumes
from email_utils import send_email

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

# Store processed JD and resumes in memory for matching
current_session = {
    "jd": None,
    "resumes": {}
}

# Create a single model instance for reuse
model = SentenceTransformer("all-MiniLM-L6-v2")

@app.post("/embed")
def get_embedding(request: JDRequest):
    """Process a job description and generate its embedding"""
    title, embedding = generate_jd_embedding(request.text)
    sections = extract_sections(request.text)
    
    # Store in current session
    current_session["jd"] = {
        "title": title,
        "embedding": embedding,
        "sections": sections
    }
    
    # Convert embedding dictionary properly for JSON response
    serializable_embedding = json.loads(
        json.dumps(embedding, cls=NumpyEncoder)
    )
    
    return {
        "title": title,
        "embedding": serializable_embedding,
        "sections": sections
    }

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
        # Extract text from PDF
        text = pdf_to_text(file_path)
        
        # Parse resume sections
        parsed_sections = extract_resume_sections(text)
        
        # Generate section-specific embeddings for matching
        section_embeddings = {
            "experience": None,
            "education": None, 
            "skills": None,
            "projects": None,
            "certifications": None
        }
        
        # Generate embeddings for each section if available
        for section in section_embeddings.keys():
            if section in parsed_sections and parsed_sections[section]:
                section_text = " ".join(parsed_sections[section])
                if section_text.strip():
                    # Use the global model instance
                    section_embeddings[section] = model.encode(section_text, convert_to_numpy=True)
        
        # Return results for this resume
        return filename, {
            "parsed": parsed_sections,
            "embedding": section_embeddings,
            "text": text
        }
                
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")
        return filename, {"error": str(e)}

@app.post("/match")
def match_resumes():
    """Match the current JD with all processed resumes"""
    if not current_session["jd"]:
        raise HTTPException(status_code=400, detail="No job description processed yet")
    
    if not current_session["resumes"]:
        raise HTTPException(status_code=400, detail="No resumes processed yet")
    
    jd_title = current_session["jd"].get("title", "Unknown Position")
    jd_embeddings = current_session["jd"].get("embedding", {})
    
    # Match each resume against the JD
    matches = []
    for filename, resume_data in current_session["resumes"].items():
        parsed = resume_data["parsed"]
        embedding = resume_data.get("embedding", {})
        
        # Extract name from parsed resume or use filename
        name = _extract_name(parsed, filename)
        
        # Use the matcher module's calculate_match_score function with the correct parameters
        score, reasoning = calculate_match_score(jd_embeddings, embedding)
        
        matches.append({
            "name": name,
            "filename": filename,
            "score": score,
            "reasoning": reasoning,
            "isMatch": score >= 0.4  # Threshold for matching
        })
    
    # Sort matches by score in descending order
    matches.sort(key=lambda x: x["score"], reverse=True)
    
    return {"matches": matches}

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
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

