# --- matcher.py ---
from sentence_transformers import SentenceTransformer, util
import numpy as np

# Load SBERT model
sbert = SentenceTransformer("all-MiniLM-L6-v2")

# Weights for scoring each section with proper section mapping
weights = {
    "skills": 0.3,
    "experience": 0.25,
    "qualifications": 0.25,  # Added to match JD sections
    "responsibilities": 0.15, # Added to match JD sections
    "education": 0.05,       # Reduced weight since it may not be in JD
    "certifications": 0.0    # Zero weight until we address mapping
}

# Map resume sections to JD sections for comparison
section_mapping = {
    "education": ["qualifications", "education"],  # Check resume education against JD qualifications too
    "skills": ["skills"],
    "experience": ["experience"],
    "certifications": ["qualifications", "certifications"],
    "projects": ["experience", "skills"]  # Projects can match against experience or skills
}

def calculate_match_score(jd_sections, resume_sections):
    score = 0.0
    explanation = []
    total_weight = 0.0
    
    # Debug output
    print(f"JD sections: {list(jd_sections.keys())}")
    print(f"Resume sections: {list(resume_sections.keys())}")
    
    # Process JD sections with weights
    for resume_section, weight in weights.items():
        # Skip sections with zero weight
        if weight == 0:
            continue
            
        resume_text = " ".join(resume_sections.get(resume_section, []))
        
        # For each resume section, check mapped JD sections
        jd_section_matches = []
        jd_section_texts = []
        
        # Get possible JD sections to compare against (using mapping or direct match)
        jd_section_names = section_mapping.get(resume_section, [resume_section])
        
        for jd_section_name in jd_section_names:
            jd_text = " ".join(jd_sections.get(jd_section_name, []))
            if jd_text:
                jd_section_texts.append(jd_text)
        
        # Combine all relevant JD texts
        combined_jd_text = " ".join(jd_section_texts)
        
        if combined_jd_text and resume_text:
            jd_emb = sbert.encode(combined_jd_text, convert_to_tensor=True)
            resume_emb = sbert.encode(resume_text, convert_to_tensor=True)
            sim = float(util.cos_sim(jd_emb, resume_emb).item())
            
            # Debug print the similarity score
            print(f"Section {resume_section}: Similarity = {sim:.4f}")
            
            score += sim * weight
            total_weight += weight
            explanation.append(f"{resume_section.title()}: {round(sim*100, 1)}% match")
        else:
            if not combined_jd_text:
                print(f"No JD text for section {resume_section}")
            if not resume_text:
                print(f"No resume text for section {resume_section}")
            explanation.append(f"{resume_section.title()}: No info available")
    
    # Normalize score if we have weights
    if total_weight > 0:
        score = score / total_weight
    
    print(f"Final score: {score:.4f}")
    return round(score, 3), explanation

def match_all_resumes(jd_sections, resume_data):
    matched_candidates = []

    for filename, data in resume_data.items():
        parsed = data["parsed"]
        embedding = data["embedding"]
        name = parsed.get("name", [filename])[0]

        score, reasoning = calculate_match_score(jd_sections, parsed)

        if score >= 0.0: # Adjust threshold as needed
            matched_candidates.append({
                "name": name,
                "score": score,
                "reasoning": reasoning
            })

    return matched_candidates
