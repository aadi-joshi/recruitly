# Resume Match Pro - AI-Powered Job Application Screening System

This application provides an end-to-end workflow for matching job descriptions with candidate resumes using natural language processing and semantic similarity techniques.

## Features

- **Job Description Analysis**: Extract key information from job descriptions including skills, experience, and qualifications
- **Resume Processing**: Upload and parse multiple PDF resumes
- **AI-Powered Matching**: Match resumes against job descriptions with section-by-section analysis
- **Detailed Results**: View match scores, reasoning, and visualizations
- **Interview Scheduling**: Automatically generate interview slots and send invitations to qualified candidates
- **Multi-Agent System**: Specialized AI agents work together to handle different aspects of the recruitment process

## Project Structure

- `/backend` - FastAPI server with NLP utilities
  - `app.py` - Main server with API endpoints
  - `agent_framework.py` - Multi-agent architecture implementation
  - `jd_embedding_utils.py` - Job description parsing and embedding
  - `resume_embedding_utils.py` - Resume parsing and embedding
  - `matcher.py` - Matching logic with weighted scoring
  - `email_utils.py` - Email sending utilities

- `/frontend` - React + Vite + Tailwind application
  - Complete workflow UI with step-by-step process
  - Interactive components for each stage of the recruitment process

## Multi-Agent Architecture

The system uses a coordinated multi-agent approach:

1. **JD Analyzer Agent**: Processes and extracts information from job descriptions
2. **CV Analyzer Agent**: Processes and extracts information from resumes
3. **Matching Agent**: Compares job descriptions with resumes to find qualified candidates
4. **Scheduler Agent**: Handles interview scheduling for qualified candidates
5. **Agent Coordinator**: Orchestrates the workflow between all specialized agents

For more details, see [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md).

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

### Step 3: Matching and Scheduling
1. Click "Match Resumes" to compare the job description with all resumes
2. Review the results showing:
   - Match scores for each candidate
   - Section-by-section comparison
   - Visual representation of match results
3. Click the calendar icon next to qualified candidates to schedule interviews
4. Select interview slots and send automated email invitations

## API Endpoints

- `POST /embed` - Process a job description and generate embedding
- `POST /upload-resumes` - Upload and process multiple resume PDFs
- `POST /match` - Match current job description with processed resumes
- `POST /prepare-interview-email/{candidate_id}` - Generate interview email for a candidate
- `POST /send-email` - Send email to candidate
- `GET /suggest-interview-times/{candidate_id}` - Generate available interview slots
- `GET /clear-session` - Reset the current session data

## Technology Stack

- **Backend**: FastAPI, NLTK, spaCy, Sentence Transformers
- **Frontend**: React, Vite, Tailwind CSS, Chart.js
- **PDF Processing**: PDF.js, pdfplumber
- **NLP**: Sentence Transformers for semantic embeddings
- **Email**: SMTP for sending interview invitations

## Troubleshooting

### Verifying Agent Framework Operation

To verify the agent framework is correctly processing your PDFs:

1. **Enable Debug Logging**:
   ```
   # In backend/app.py
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

2. **Monitor Agent Activities**:
   The console will show detailed information about:
   - PDF text extraction
   - Section identification
   - Embedding generation
   - Matching calculations
   - Agent communication

3. **Inspect API Responses**:
   - After uploading PDFs, check the `/upload-resumes` response
   - Review extracted sections and text quality
   - Ensure candidate information is correctly identified

4. **Validate PDF Processing**:
   - Text extraction should maintain document structure
   - Formatting issues like extra spaces or special characters should be handled
   - Multi-column layouts and tables should be processed correctly
