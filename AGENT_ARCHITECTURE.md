# Multi-Agent Architecture for Recruitly Job Application Screening

This document outlines the multi-agent architecture implemented in the Recruitly system.

## Agent System Overview

The system utilizes a coordinated multi-agent approach where specialized agents handle different aspects of the recruitment workflow. Each agent has specific responsibilities and skills, working together to provide a comprehensive application screening solution.

```
┌─────────────────────────┐
│    Agent Coordinator    │
└──────────┬──────────────┘
           │
           ▼
┌──────────┴─────────────┬───────────────────┬───────────────────┐
│                        │                   │                   │
▼                        ▼                   ▼                   ▼
┌──────────────────┐ ┌───────────────┐ ┌────────────┐ ┌──────────────────┐
│ JD Analyzer Agent│ │ CV Analyzer   │ │ Matching   │ │ Scheduler Agent  │
│                  │ │ Agent         │ │ Agent      │ │                  │
└──────────────────┘ └───────────────┘ └────────────┘ └──────────────────┘
```

## Agent Descriptions

### 1. Agent Coordinator

The Agent Coordinator acts as the central orchestrator for the entire system. It:
- Manages communication between agents
- Coordinates the workflow from JD analysis to interview scheduling
- Maintains the state of the current session
- Handles error recovery and logging

### 2. JD Analyzer Agent

The JD Analyzer Agent specializes in understanding job descriptions:
- Analyzes and extracts structured information from job descriptions
- Identifies key sections (responsibilities, qualifications)
- Generates embeddings for semantic matching
- Creates human-readable summaries

### 3. CV Analyzer Agent

The CV Analyzer Agent focuses on resume processing:
- Extracts text from PDF resumes
- Identifies and parses resume sections (skills, experience, education)
- Generates embeddings for each section
- Creates structured representations for matching

### 4. Matching Agent

The Matching Agent compares job descriptions with resumes:
- Calculates section-by-section similarity scores
- Applies weighted algorithms to determine overall match percentages
- Provides detailed reasoning for match results
- Identifies candidates above the qualification threshold

### 5. Scheduler Agent

The Scheduler Agent handles interview coordination:
- Generates available interview time slots
- Creates personalized email templates for candidates
- Sends interview invitations with scheduling options
- Manages the interview scheduling process

## Technical Implementation

The multi-agent system is implemented using:
- Agent classes with inheritance from a base Agent class
- Specialized methods for each agent's domain
- Shared state management
- Integration with NLP utilities
- Logging for agent actions and decision reasoning

## Communication Flow

1. User submits a job description
2. JD Analyzer Agent processes and extracts structure
3. User uploads candidate resumes
4. CV Analyzer Agent processes each resume
5. Matching Agent compares JD with resumes
6. Scheduler Agent prepares interviews for matched candidates
7. System presents results and scheduling options to user

## Benefits of Multi-Agent Approach

- **Separation of Concerns**: Each agent specializes in a specific aspect of the workflow
- **Maintainability**: Changes to one agent don't impact others
- **Extensibility**: New agents can be added for additional functionality
- **Scalability**: Processing can be distributed across multiple agents
- **Robustness**: Failure in one agent doesn't compromise the entire system
- **Transparency**: Each agent logs its actions and reasoning
