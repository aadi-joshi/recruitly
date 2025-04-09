import re
import nltk
from nltk.tokenize import sent_tokenize
from collections import defaultdict
from sentence_transformers import SentenceTransformer, util
import spacy
import numpy as np

# Safely ensure nltk punkt is available
try:
    nltk.data.find("tokenizers/punkt_tab")
except LookupError:
    nltk.download("punkt_tab")

# Load SBERT & spaCy
sbert = SentenceTransformer("paraphrase-MiniLM-L6-v2")
nlp = spacy.load("en_core_web_sm")

# Semantic templates for classification
TEMPLATES = {
    "job_title": ["We're hiring a Backend Developer", "Job Title: Cloud Engineer", "Looking for a Product Manager"],
    "responsibilities": ["Responsible for building and maintaining systems", "You will collaborate with teams", "Expected to deliver high performance"],
    "qualifications": ["Bachelor's or Master's in CS", "PhD in relevant field", "Degree in engineering or related field"],
    "experience": ["3+ years in software development", "5+ years experience in AI", "Experience required in production ML"],
    "skills": ["Proficient in Python, AWS, Docker", "Skilled in NLP and PyTorch", "Hands-on with JavaScript and React"]
}

TEMPLATE_EMBEDDINGS = {k: sbert.encode(v, convert_to_tensor=True) for k, v in TEMPLATES.items()}

COMMON_HEADERS = ['description:', 'job description:', 'responsibilities:', 'qualifications:', 'experience:', 'skills:', 'certifications:']

def clean_line(line):
    line_lower = line.lower()
    for header in COMMON_HEADERS:
        if line_lower.strip().startswith(header):
            return line[len(header):].strip()
    return line.strip()

def classify_line(line):
    line_embedding = sbert.encode(line, convert_to_tensor=True)
    scores = {k: float(util.cos_sim(line_embedding, TEMPLATE_EMBEDDINGS[k]).max()) for k in TEMPLATE_EMBEDDINGS}
    best_match = max(scores, key=scores.get)
    return best_match if scores[best_match] > 0.4 else None

def extract_job_title(text):
    match = re.search(
        r"We are (seeking|looking for|hiring)( an?| a)? (?P<title>([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*))",
        text, re.IGNORECASE)
    if match:
        return match.group("title").strip()

    match = re.search(r"Job Title[:\-]?\s*(?P<title>[A-Z][\w\s\-]+)", text)
    if match:
        return match.group("title").strip()

    doc = nlp(sent_tokenize(text)[0])
    for chunk in doc.noun_chunks:
        if chunk.root.pos_ in ["NOUN", "PROPN"] and chunk.text.istitle():
            return chunk.text.strip()
    return "Unknown"

def extract_sections(text):
    lines = sent_tokenize(text)
    results = defaultdict(list)
    results["job_title"] = extract_job_title(text)

    for line in lines:
        cleaned = clean_line(line)
        if not cleaned or cleaned.isspace():
            continue
        category = classify_line(cleaned)
        if category and category != "job_title":
            results[category].append(cleaned)

    return dict(results)

def generate_jd_embedding(jd_text):
    parsed = extract_sections(jd_text)
    title = parsed.get("job_title", "Unknown")

    combined_text = " ".join(
        parsed.get("skills", []) +
        parsed.get("experience", []) +
        parsed.get("responsibilities", []) +
        parsed.get("qualifications", [])
    )

    if not combined_text:
        combined_text = jd_text

    embedding = sbert.encode(combined_text, convert_to_numpy=True)
    return title, embedding
