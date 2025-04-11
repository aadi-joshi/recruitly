# Job Application Screening Workflow

This document explains the end-to-end workflow of the Recruitly Job Application Screening System.

## Overview

The system uses multiple AI agents to automate the recruitment process from job description analysis to interview scheduling. Each step in the process is designed to save time for recruiters while maintaining quality in candidate selection.

## Step 1: Job Description Analysis

### Process:
1. Recruiter pastes or uploads a job description
2. JD Analyzer Agent processes the text using NLP techniques
3. The system extracts:
   - Job title
   - Responsibilities
   - Qualifications
   - Skills
4. The text is converted into embeddings (vector representations)
5. A human-readable summary is generated

### Technical Details:
- Sentence transformers create semantic embeddings
- Pattern matching identifies key sections
- Text classification categorizes content
- Embeddings are stored for later matching

## Step 2: Resume Processing

### Process:
1. Recruiter uploads one or more candidate resumes (PDF format)
2. CV Analyzer Agent processes each document
3. For each resume, the system:
   - Extracts text from PDF
   - Identifies sections (education, experience, skills, etc.)
   - Creates embeddings for each section
   - Generates a structured representation

### Technical Details:
- PDFPlumber extracts text content
- NLP techniques identify section boundaries
- Named Entity Recognition detects candidate names
- Section-specific embeddings capture semantic meaning

## Step 3: Candidate Matching

### Process:
1. Matching Agent compares each resume against the job description
2. The system calculates:
   - Section-by-section similarity scores
   - Overall match percentage
   - Weighted relevance based on key requirements
3. Candidates are ranked by match score
4. Detailed explanations are provided for each match

### Technical Details:
- Cosine similarity measures semantic closeness
- Section-specific weights prioritize important aspects
- Threshold filtering identifies qualified candidates
- Reasoning generation explains match decisions

## Step 4: Interview Scheduling

### Process:
1. Recruiter selects matched candidates for interviews
2. Scheduler Agent generates available time slots
3. The system prepares personalized email invitations with:
   - Candidate's name and qualifications
   - Available interview slots
   - Position details
4. Emails are sent automatically to candidates

### Technical Details:
- Date/time generation accounts for business hours
- Email templating creates personalized messages
- SMTP integration sends emails to candidates
- Slot management prevents double-booking

## Benefits

This AI-powered workflow provides significant advantages:

1. **Time Savings**: Reduces manual resume screening by 85%
2. **Consistency**: Applies the same criteria to all candidates
3. **Reduced Bias**: Focuses on qualifications rather than demographics
4. **Scalability**: Processes hundreds of applications efficiently
5. **Better Matches**: Semantic understanding finds qualified candidates who might be missed by keyword matching
6. **Transparency**: Provides explanations for all matching decisions

## Technical Architecture

The workflow is powered by a multi-agent system where specialized AI agents handle different parts of the process:

- **Agent Coordinator**: Orchestrates the workflow
- **JD Analyzer Agent**: Specialized in job description understanding
- **CV Analyzer Agent**: Focused on resume interpretation
- **Matching Agent**: Expert in comparing job requirements with candidate qualifications
- **Scheduler Agent**: Manages interview scheduling

See [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) for detailed technical implementation.
