
# --- Imports ---
import re
import nltk
import spacy
import pdfplumber
import numpy as np
from nltk import sent_tokenize
from collections import defaultdict
from sentence_transformers import SentenceTransformer, util
from pathlib import Path

# --- Setup ---
nltk.download("punkt")
nlp = spacy.load("en_core_web_sm")
sbert = SentenceTransformer("all-MiniLM-L6-v2")

# --- PDF → Text ---
def pdf_to_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join([page.extract_text() or "" for page in pdf.pages])

# --- Templates for classification ---
RESUME_TEMPLATES = {
    "name": ["My name is", "Resume of", "Name:"],
    "skills": ["Skills: Python, Java", "Proficient in C++ and ML", "Familiar with Tableau and Excel"],
    "experience": ["Worked at Google", "Software Engineer at Amazon", "Internship at Meta"],
    "education": ["Bachelor of Technology from IIT", "Master's in Data Science", "PhD from Stanford"],
    "certifications": ["AWS Certified", "Google Cloud Certified", "Completed PMP Certification"],
    "projects": ["Built an AI chatbot", "Developed an app", "Project: Deep Learning"]
}

TEMPLATE_EMBEDDINGS = {k: sbert.encode(v, convert_to_tensor=True) for k, v in RESUME_TEMPLATES.items()}
COMMON_HEADERS = ["skills:", "experience:", "education:", "projects:", "certifications:", "name:"]

# --- Cleaning ---
def clean_line(line):
    line_lower = line.lower()
    for header in COMMON_HEADERS:
        if line_lower.strip().startswith(header):
            return line[len(header):].strip()
    return line.strip()

# --- Classify each sentence ---
def classify_resume_line(line):
    emb = sbert.encode(line, convert_to_tensor=True)
    scores = {k: float(util.cos_sim(emb, TEMPLATE_EMBEDDINGS[k]).max()) for k in TEMPLATE_EMBEDDINGS}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0.4 else None

# --- Main Extractor ---
def extract_resume_sections(text):
    lines = sent_tokenize(text)
    sections = defaultdict(list)
    for line in lines:
        cleaned = clean_line(line)
        if not cleaned:
            continue
        label = classify_resume_line(cleaned)
        if label:
            sections[label].append(cleaned)
    return dict(sections)

# --- Generate Embedding from parsed resume ---
def generate_resume_embedding(parsed_resume):
    combined = " ".join(
        parsed_resume.get("skills", []) +
        parsed_resume.get("experience", []) +
        parsed_resume.get("education", []) +
        parsed_resume.get("certifications", []) +
        parsed_resume.get("projects", [])
    )
    if not combined.strip():
        return sbert.encode("generic resume", convert_to_numpy=True)
    return sbert.encode(combined, convert_to_numpy=True)

# --- Batch process multiple resumes ---
def generate_embeddings_for_all_resumes(pdf_paths):
    results = {}
    for pdf_path in pdf_paths:
        file_name = Path(pdf_path).name
        text = pdf_to_text(pdf_path)
        parsed = extract_resume_sections(text)
        embedding = generate_resume_embedding(parsed)
        results[file_name] = {
            "embedding": embedding,
            "parsed": parsed
        }
    return results
