import re
import nltk
from nltk import sent_tokenize
from collections import defaultdict
from sentence_transformers import SentenceTransformer, util
import spacy
import numpy as np

# Ensure nltk data is available
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")

# Load models
sbert = SentenceTransformer("all-MiniLM-L6-v2")
nlp = spacy.load("en_core_web_sm")

# Relevant templates
TEMPLATES = {
    "job_title": ["We're hiring a Backend Developer", "Job Title: Cloud Engineer", "Looking for a Product Manager"],
    "responsibilities": ["You will collaborate with teams", "Expected to deliver high performance"],
    "qualifications": ["Bachelor's or Master's in CS", "Degree in engineering or related field"]
}

TEMPLATE_EMBEDDINGS = {k: sbert.encode(v, convert_to_tensor=True) for k, v in TEMPLATES.items()}

COMMON_HEADERS = ['responsibilities', 'qualifications']

def clean_line(line):
    return line.strip()

def classify_line(line):
    line_embedding = sbert.encode(line, convert_to_tensor=True)
    scores = {k: float(util.cos_sim(line_embedding, TEMPLATE_EMBEDDINGS[k]).max()) for k in TEMPLATE_EMBEDDINGS}
    best_match = max(scores, key=scores.get)
    return best_match if scores[best_match] > 0.4 else None

def extract_job_title(text):
    # Regex-based extraction
    patterns = [
        r"We are (seeking|looking for|hiring)( an?| a)? (?P<title>[A-Z][a-zA-Z\s\-]+)",
        r"Job Title[:\-]?\s*(?P<title>[A-Z][\w\s\-]+)"
    ]
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            title = match.group("title").strip()

            # Trim any filler trailing words
            for stop_word in [" to ", " who ", " that ", " and ", " for ", " with "]:
                if stop_word in title:
                    title = title.split(stop_word)[0].strip()
                    break

            if title.lower() not in ["responsibilities", "description", "qualifications"]:
                return title

    # Manual fallback: check for job title in lines
    for line in text.splitlines():
        if "job title" in line.lower():
            return line.split(":")[-1].strip()

    # Final fallback: first short line that isn’t a section
    for line in text.splitlines():
        line = line.strip()
        if not line or line.lower().startswith(("description", "responsibilities", "qualifications")):
            continue
        if len(line.split()) <= 7 and line[0].isupper():
            return line.strip()

    return "Unknown"

def extract_sections(text):
    lines = text.splitlines()
    results = defaultdict(list)
    results["job_title"] = extract_job_title(text)

    current_section = None
    normalized_headers = {
        'responsibilities': 'responsibilities',
        'qualifications': 'qualifications'
    }

    for line in lines:
        raw_line = line.strip()
        if not raw_line:
            continue

        lower_line = raw_line.lower().strip(":").strip()
        if lower_line in normalized_headers:
            current_section = normalized_headers[lower_line]
            continue

        if current_section:
            results[current_section].append(raw_line)
        else:
            category = classify_line(raw_line)
            if category and category != "job_title":
                results[category].append(raw_line)

    print("🔍 JD Section Classification Results (final):")
    for section, content in results.items():
        if section != "job_title":
            print(f"  {section}: {len(content)} lines")

    return dict(results)

def generate_jd_embedding(jd_text):
    parsed = extract_sections(jd_text)
    title = parsed.get("job_title", "Unknown")

    embeddings_by_section = {}
    for section in ["responsibilities", "qualifications"]:
        lines = parsed.get(section, [])
        if lines:
            combined = " ".join(lines)
            emb = sbert.encode(combined, convert_to_numpy=True)
            embeddings_by_section[section] = emb
            print(f"✅ Embedded section '{section}': shape = {emb.shape}")
        else:
            print(f"❌ No content found for section '{section}'")
            embeddings_by_section[section] = None

    return title, embeddings_by_section