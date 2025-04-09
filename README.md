# Resume Match Pro - AI-Powered Job Application Screening System

This application provides an end-to-end workflow for matching job descriptions with candidate resumes using natural language processing and semantic similarity techniques.

## Features

- **Job Description Analysis**: Extract key information from job descriptions including skills, experience, and qualifications
- **Resume Processing**: Upload and parse multiple PDF resumes
- **AI-Powered Matching**: Match resumes against job descriptions with section-by-section analysis
- **Detailed Results**: View match scores, reasoning, and visualizations

## Project Structure

- `/backend` - FastAPI server with NLP utilities
  - `app.py` - Main server with API endpoints
  - `jd_embedding_utils.py` - Job description parsing and embedding
  - `resume_embedding_utils.py` - Resume parsing and embedding
  - `matcher.py` - Matching logic with weighted scoring

- `/frontend` - React + Vite + Tailwind application
  - Complete workflow UI with step-by-step process

## Setup Instructions

### Backend Setup

1. Install the required dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

2. Download the spaCy model:
   ```
   python -m spacy download en_core_web_sm
   ```

3. Start the backend server:
   ```
   python app.py
   ```
   The server will run at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the frontend dependencies:
   ```
   npm install
   ```

3. If you encounter missing dependency errors, install them explicitly:
   ```
   npm install react-toastify chart.js react-chartjs-2
   ```

4. Start the development server:
   ```
   npm run dev
   ```
   The React application will be available at `http://localhost:3000`

## Usage Workflow

### Step 1: Job Description Analysis
1. Paste a job description into the text area
2. Click "Analyze Job Description"
3. Review the extracted information (job title, skills, experience, etc.)

### Step 2: Resume Upload
1. Upload multiple candidate resumes (PDF format)
2. Click "Process Resumes"
3. Wait for the system to extract and process each resume

### Step 3: Matching
1. Click "Match Resumes" to compare the job description with all resumes
2. Review the results showing:
   - Match scores for each candidate
   - Section-by-section comparison (Skills, Experience, Education, etc.)
   - Visual representation of match results

## API Endpoints

- `POST /embed` - Process a job description and generate embedding
- `POST /upload-resumes` - Upload and process multiple resume PDFs
- `POST /match` - Match current job description with processed resumes
- `GET /clear-session` - Reset the current session data

## Technology Stack

- **Backend**: FastAPI, NLTK, spaCy, Sentence Transformers
- **Frontend**: React, Vite, Tailwind CSS, Chart.js
- **PDF Processing**: PDF.js, pdfplumber
#   r e s u m e _ s h o r t l i s t i n g _ m o d e l  
 