# --- resume_embedding_utils.py ---
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

# --- Templates for fallback classification ---
RESUME_TEMPLATES = {
    "name": ["My name is", "Resume of", "Name:"],
    "skills": ["Skills: Python, Java", "Proficient in C++ and ML"],
    "experience": ["Worked at Google", "Software Engineer at Amazon"],
    "education": ["Bachelor of Technology from IIT", "Master's in Data Science"],
    "certifications": ["AWS Certified", "Completed PMP Certification"],
    "projects": ["Built an AI chatbot", "Project: Deep Learning"],
    "tech_stack": ["Tech Stack: Python, TensorFlow", "Languages: Java, C++"]
}

TEMPLATE_EMBEDDINGS = {
    k: sbert.encode(v, convert_to_tensor=True)
    for k, v in RESUME_TEMPLATES.items()
}

COMMON_HEADERS = {
    "skills": ["skills", "technical skills"],
    "experience": ["experience", "work experience", "employment"],
    "education": ["education", "academics"],
    "certifications": ["certifications"],
    "projects": ["projects", "achievements"],
    "tech_stack": ["tech stack", "languages", "tools"],
    "name": ["name", "profile"]
}

def normalize_header(text):
    lower = text.lower().strip().strip(":")
    for section, aliases in COMMON_HEADERS.items():
        if any(lower.startswith(alias) for alias in aliases):
            return section
    return None

def classify_line(line):
    emb = sbert.encode(line, convert_to_tensor=True)
    scores = {
        k: float(util.cos_sim(emb, TEMPLATE_EMBEDDINGS[k]).max())
        for k in TEMPLATE_EMBEDDINGS
    }
    best = max(scores, key=scores.get)
    return best if scores[best] > 0.4 else None

def extract_name(text):
    for line in text.splitlines():
        doc = nlp(line.strip())
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return ent.text.strip()
    return None

def pdf_to_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join([page.extract_text() or "" for page in pdf.pages])

def extract_resume_sections(text):
    lines = text.splitlines()
    merged_lines = []
    prev_line = ""

    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        if prev_line and (line[0].islower() or line.startswith(("and", "which", "-", "or", ",", "of", "to"))):
            merged_lines[-1] += " " + line
        else:
            merged_lines.append(line)
            prev_line = line

    sections = defaultdict(list)
    current_section = None
    name_found = extract_name(text)

    for line in merged_lines:
        normalized = normalize_header(line)
        if normalized:
            current_section = normalized
            continue

        lower = line.lower()
        if any(w in lower for w in ["bachelor", "ph.d", "master", "diploma", "msc", "b.tech", "mba"]):
            current_section = "education"
        elif "tech stack" in lower or "languages" in lower or "tools" in lower:
            current_section = "tech_stack"
        elif "achievements" in lower or line.startswith(("Built", "Developed")) or "project" in lower:
            current_section = "projects"
        elif "work experience" in lower or re.search(r"(intern|engineer|manager|scientist|developer)", lower):
            current_section = "experience"

        if not current_section:
            current_section = classify_line(line)

        if current_section:
            if current_section in ["education", "experience", "certifications"] and sections[current_section]:
                if line[0].islower() or re.match(r"^(Concentrated|Focused|Research|Worked|Led|Responsible|Published|with|and|using|or|to)\b", line):
                    sections[current_section][-1] += " " + line
                    continue
            sections[current_section].append(line)

    if name_found and name_found not in sections.get("name", []):
        sections["name"].insert(0, name_found)

    return dict(sections)

def generate_resume_embedding(parsed_resume):
    combined = " ".join(
        parsed_resume.get("skills", []) +
        parsed_resume.get("experience", []) +
        parsed_resume.get("education", []) +
        parsed_resume.get("certifications", []) +
        parsed_resume.get("projects", []) +
        parsed_resume.get("tech_stack", [])
    )
    if not combined.strip():
        return sbert.encode("generic resume", convert_to_numpy=True)
    return sbert.encode(combined, convert_to_numpy=True)

def generate_embeddings_for_all_resumes(pdf_paths):
    results = {}

    print("\n🧪 DEBUGGING RESUME PARSING:\n")

    for pdf_path in pdf_paths:
        file_name = Path(pdf_path).name
        text = pdf_to_text(pdf_path)
        parsed = extract_resume_sections(text)

        print(f"\n📄 Resume: {file_name}")
        for section in ["name", "skills", "experience", "education", "certifications", "projects", "tech_stack"]:
            lines = parsed.get(section)
            if lines:
                print(f"  ✅ {section.title()}: {len(lines)} line(s)")
            else:
                print(f"  ❌ {section.title()}: Not found")

        embedding = generate_resume_embedding(parsed)
        print(f"  🔢 Embedding shape: {embedding.shape}")

        results[file_name] = {
            "embedding": {
                "skills": sbert.encode(" ".join(parsed.get("skills", [])), convert_to_numpy=True) if parsed.get("skills") else None,
                "experience": sbert.encode(" ".join(parsed.get("experience", [])), convert_to_numpy=True) if parsed.get("experience") else None,
                "education": sbert.encode(" ".join(parsed.get("education", [])), convert_to_numpy=True) if parsed.get("education") else None,
                "certifications": sbert.encode(" ".join(parsed.get("certifications", [])), convert_to_numpy=True) if parsed.get("certifications") else None,
                "projects": sbert.encode(" ".join(parsed.get("projects", [])), convert_to_numpy=True) if parsed.get("projects") else None,
                "tech_stack": sbert.encode(" ".join(parsed.get("tech_stack", [])), convert_to_numpy=True) if parsed.get("tech_stack") else None,
            },
            "parsed": parsed
        }

    return results
