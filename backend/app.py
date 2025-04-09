from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import tempfile
import os
import shutil
from typing import List, Dict, Any
import json
import numpy as np
from pathlib import Path

from jd_embedding_utils import generate_jd_embedding, extract_sections
from resume_embedding_utils import pdf_to_text, extract_resume_sections, generate_resume_embedding
from matcher import calculate_match_score

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
    
    return {
        "title": title,
        "embedding": embedding.tolist(),
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
        
        for file in files:
            # Save the uploaded file temporarily
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            try:
                # Extract text from PDF
                text = pdf_to_text(file_path)
                
                # Parse resume sections
                parsed_sections = extract_resume_sections(text)
                
                # Generate embedding
                embedding = generate_resume_embedding(parsed_sections)
                
                # Store results
                resume_results[file.filename] = {
                    "parsed": parsed_sections,
                    "embedding": embedding,
                    "text": text
                }
                
                # Add to current session
                current_session["resumes"][file.filename] = {
                    "parsed": parsed_sections,
                    "embedding": embedding,
                    "text": text
                }
                
            except Exception as e:
                print(f"Error processing {file.filename}: {str(e)}")
                resume_results[file.filename] = {"error": str(e)}
    
    # Convert NumPy arrays to lists for JSON response
    serializable_results = json.loads(
        json.dumps(resume_results, cls=NumpyEncoder)
    )
    
    return JSONResponse(content=serializable_results)

@app.post("/match")
def match_resumes():
    """Match the current JD with all processed resumes"""
    if not current_session["jd"]:
        raise HTTPException(status_code=400, detail="No job description processed yet")
    
    if not current_session["resumes"]:
        raise HTTPException(status_code=400, detail="No resumes processed yet")
    
    jd_sections = current_session["jd"]["sections"]
    
    # Match each resume against the JD
    matches = []
    for filename, resume_data in current_session["resumes"].items():
        parsed = resume_data["parsed"]
        name = parsed.get("name", [filename])[0] if "name" in parsed and parsed["name"] else Path(filename).stem
        
        score, reasoning = calculate_match_score(jd_sections, parsed)
        
        matches.append({
            "name": name,
            "filename": filename,
            "score": score,
            "reasoning": reasoning,
            "isMatch": score >= 0.4  # Lower threshold from 0.6 to 0.4
        })
    
    # Sort matches by score in descending order
    matches.sort(key=lambda x: x["score"], reverse=True)
    
    return {"matches": matches}

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

