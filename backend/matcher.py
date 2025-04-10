from sentence_transformers import util
import numpy as np

# Weights for each aligned JD section
weights = {
    "responsibilities": 0.6,
    "qualifications": 0.6
}

# Function to compute cosine similarity with fallback
def safe_cos_sim(vec1, vec2):
    if vec1 is None or vec2 is None:
        return 0.0
    return float(util.cos_sim(vec1, vec2).item())

# Enhanced explanation with match levels
def interpret_match(label, score):
    if score >= 0.75:
        return f"✅ Strong alignment in {label}: {round(score * 100, 1)}%"
    elif score >= 0.5:
        return f"⚠️ Partial alignment in {label}: {round(score * 100, 1)}%"
    else:
        return f"❌ Weak alignment in {label}: {round(score * 100, 1)}%"

# Matching logic
def calculate_match_score(jd_embeddings, resume_embeddings):
    explanation = []
    total_score = 0.0

    # Responsibilities: experience + projects
    jd_resp = jd_embeddings.get("responsibilities")
    resume_resp = _combine_embeddings([
        resume_embeddings.get("experience"),
        resume_embeddings.get("projects")
    ])
    sim_resp = safe_cos_sim(jd_resp, resume_resp)
    total_score += sim_resp * weights["responsibilities"]
    explanation.append(interpret_match("Responsibilities", sim_resp))

    # Qualifications: education + certs + skills
    jd_qual = jd_embeddings.get("qualifications")
    resume_qual = _combine_embeddings([
        resume_embeddings.get("education"),
        resume_embeddings.get("certifications"),
        resume_embeddings.get("skills")
    ])
    sim_qual = safe_cos_sim(jd_qual, resume_qual)
    total_score += sim_qual * weights["qualifications"]
    explanation.append(interpret_match("Qualifications", sim_qual))

    return round(total_score, 3), explanation

# Combine multiple numpy vectors into one
def _combine_embeddings(embeddings_list):
    valid = [vec for vec in embeddings_list if vec is not None]
    if not valid:
        return None
    return np.mean(valid, axis=0)

# Main matcher
def match_all_resumes(jd_title, jd_embeddings, resume_data, threshold=0.8):
    matched_candidates = []

    print(f"\n📌 Matching resumes against JD: **{jd_title}**\n")

    for filename, data in resume_data.items():
        parsed = data.get("parsed", {})
        embeddings = data.get("embedding", {})

        name = _extract_name(parsed, fallback=filename)
        score, explanation = calculate_match_score(jd_embeddings, embeddings)

        print(f"🔍 {name} — Score: {round(score*100, 1)}%")
        for line in explanation:
            print("   •", line)
        print("✅ Shortlisted\n" if score >= threshold else "❌ Not shortlisted\n")

        if score >= threshold:
            matched_candidates.append({
                "name": name,
                "score": score,
                "reasoning": explanation
            })

    return matched_candidates

# Name extractor fallback
def _extract_name(parsed, fallback="Unknown"):
    name_lines = parsed.get("name", [])
    for line in name_lines:
        if line and any(c.isalpha() for c in line):
            return line.strip()
    return fallback
