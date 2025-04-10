import logging
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any
import json

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

class Agent:
    """Base class for all agents in the system"""
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"Agent:{name}")
        self.logger.info(f"Agent {name} initialized")
        
    def log_action(self, action: str, details: Any = None):
        """Log an action taken by this agent"""
        self.logger.info(f"Action: {action} - Details: {details}")
        
    def __str__(self):
        return f"Agent({self.name})"

class JDAnalyzerAgent(Agent):
    """Agent responsible for analyzing job descriptions"""
    def __init__(self):
        super().__init__("JDAnalyzer")
        
    def analyze_jd(self, jd_text: str) -> Dict:
        """Analyze a job description to extract key information"""
        from jd_embedding_utils import generate_jd_embedding, extract_sections
        
        self.log_action("Analyzing job description", {"length": len(jd_text)})
        
        # Extract and generate embeddings
        title, embedding = generate_jd_embedding(jd_text)
        sections = extract_sections(jd_text)
        
        # Generate summary
        summary = self.generate_summary(sections)
        
        result = {
            "title": title,
            "embedding": embedding,
            "sections": sections,
            "summary": summary
        }
        
        self.log_action("Analysis complete", {"title": title})
        return result
        
    def generate_summary(self, sections: Dict) -> str:
        """Generate a human-readable summary of the job description"""
        title = sections.get("job_title", "Unknown Position")
        
        # Get responsibilities and qualifications
        responsibilities = sections.get("responsibilities", [])
        qualifications = sections.get("qualifications", [])
        
        # Generate summary text
        summary = f"Position: {title}\n\n"
        
        if responsibilities:
            summary += "Key Responsibilities:\n"
            # Limit to top 5 responsibilities for brevity
            for i, resp in enumerate(responsibilities[:5]):
                summary += f"- {resp}\n"
            if len(responsibilities) > 5:
                summary += f"- Plus {len(responsibilities) - 5} more responsibilities\n"
                
        summary += "\n"
        
        if qualifications:
            summary += "Required Qualifications:\n"
            # Limit to top 5 qualifications for brevity
            for i, qual in enumerate(qualifications[:5]):
                summary += f"- {qual}\n"
            if len(qualifications) > 5:
                summary += f"- Plus {len(qualifications) - 5} more qualifications\n"
                
        return summary

class CVAnalyzerAgent(Agent):
    """Agent responsible for analyzing candidate CVs"""
    def __init__(self):
        super().__init__("CVAnalyzer")
        
    def process_cv(self, file_path: str, filename: str) -> Dict:
        """Process a CV to extract key information"""
        from resume_embedding_utils import pdf_to_text, extract_resume_sections, generate_resume_embedding
        
        self.log_action("Processing CV", {"filename": filename})
        
        # Extract text from PDF
        text = pdf_to_text(file_path)
        
        # Parse CV sections
        parsed_sections = extract_resume_sections(text)
        
        # Generate section-specific embeddings
        section_embeddings = {}
        for section in ["experience", "education", "skills", "projects", "certifications", "tech_stack"]:
            if section in parsed_sections and parsed_sections[section]:
                section_text = " ".join(parsed_sections[section])
                if section_text.strip():
                    from sentence_transformers import SentenceTransformer
                    model = SentenceTransformer("all-MiniLM-L6-v2")
                    section_embeddings[section] = model.encode(section_text, convert_to_numpy=True)
        
        # Generate summary
        summary = self.generate_summary(parsed_sections)
        
        result = {
            "parsed": parsed_sections,
            "embedding": section_embeddings,
            "text": text,
            "summary": summary
        }
        
        self.log_action("CV processing complete", {
            "sections_found": list(parsed_sections.keys())
        })
        
        return result
    
    def generate_summary(self, sections: Dict) -> str:
        """Generate a human-readable summary of the CV"""
        name = sections.get("name", ["Unknown Candidate"])[0] if sections.get("name") else "Unknown Candidate"
        
        # Extract key information
        skills = sections.get("skills", [])
        experience = sections.get("experience", [])
        education = sections.get("education", [])
        
        # Generate summary text
        summary = f"Candidate: {name}\n\n"
        
        if skills:
            summary += "Key Skills:\n"
            # Limit to top 5 skills for brevity
            for i, skill in enumerate(skills[:5]):
                summary += f"- {skill}\n"
            if len(skills) > 5:
                summary += f"- Plus {len(skills) - 5} more skills\n"
                
        summary += "\n"
        
        if experience:
            summary += "Experience:\n"
            # Limit to top 3 experiences for brevity
            for i, exp in enumerate(experience[:3]):
                summary += f"- {exp}\n"
            if len(experience) > 3:
                summary += f"- Plus {len(experience) - 3} more experiences\n"
                
        summary += "\n"
        
        if education:
            summary += "Education:\n"
            # Limit to top 2 education entries for brevity
            for i, edu in enumerate(education[:2]):
                summary += f"- {edu}\n"
                
        return summary

class MatchingAgent(Agent):
    """Agent responsible for matching CVs against job descriptions"""
    def __init__(self, threshold: float = 0.7):
        super().__init__("Matcher")
        self.threshold = threshold
        
    def match_cvs_to_jd(self, jd_data: Dict, cv_data: Dict[str, Dict]) -> Dict:
        """Match multiple CVs against a job description"""
        from matcher import match_all_resumes
        
        self.log_action("Starting matching process", {
            "jd_title": jd_data.get("title", "Unknown"),
            "cv_count": len(cv_data)
        })
        
        jd_title = jd_data.get("title", "Unknown Position")
        jd_embeddings = jd_data.get("embedding", {})
        
        # Match each CV against the JD
        matches = []
        for filename, resume_data in cv_data.items():
            parsed = resume_data["parsed"]
            embedding = resume_data.get("embedding", {})
            
            # Extract name from parsed CV or use filename
            name = self._extract_name(parsed, filename)
            
            from matcher import calculate_match_score
            score, reasoning = calculate_match_score(jd_embeddings, embedding)
            
            match_data = {
                "name": name,
                "filename": filename,
                "score": score,
                "reasoning": reasoning,
                "isMatch": score >= self.threshold  # Use threshold for matching
            }
            
            self.log_action("CV matched", {
                "name": name,
                "score": score,
                "is_match": match_data["isMatch"]
            })
            
            matches.append(match_data)
        
        # Sort matches by score in descending order
        matches.sort(key=lambda x: x["score"], reverse=True)
        
        result = {"matches": matches}
        self.log_action("Matching complete", {
            "total_matches": len(matches),
            "qualified_matches": sum(1 for m in matches if m["isMatch"])
        })
        
        return result
    
    def _extract_name(self, parsed, fallback):
        """Extract name from parsed CV or use fallback"""
        from pathlib import Path
        if "name" in parsed and parsed["name"] and len(parsed["name"]) > 0:
            return parsed["name"][0]
        return Path(fallback).stem

class SchedulerAgent(Agent):
    """Agent responsible for scheduling interviews with matched candidates"""
    def __init__(self):
        super().__init__("Scheduler")
        
    def generate_interview_slots(self, days_ahead: int = 10, slots_per_day: int = 3) -> List[Dict]:
        """Generate available interview time slots for the next N days"""
        slots = []
        start_date = datetime.now() + timedelta(days=1)  # Start from tomorrow
        
        for day in range(days_ahead):
            current_date = start_date + timedelta(days=day)
            
            # Skip weekends
            if current_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                continue
                
            # Generate time slots for this day
            possible_hours = [9, 10, 11, 13, 14, 15, 16]  # 9 AM to 5 PM with lunch break
            selected_hours = random.sample(possible_hours, min(slots_per_day, len(possible_hours)))
            selected_hours.sort()
            
            for hour in selected_hours:
                slot_time = current_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                slots.append({
                    "date": slot_time.strftime("%Y-%m-%d"),
                    "time": slot_time.strftime("%H:%M"),
                    "datetime": slot_time,
                    "formatted": slot_time.strftime("%A, %B %d at %I:%M %p")
                })
                
        return slots
        
    def prepare_email_for_candidate(self, candidate: Dict, job_title: str) -> Dict:
        """Prepare an email for a shortlisted candidate with interview slots"""
        self.log_action("Preparing email", {"candidate": candidate["name"]})
        
        # Generate interview slots
        interview_slots = self.generate_interview_slots(days_ahead=7, slots_per_day=2)
        
        # Format the email content
        candidate_name = candidate["name"]
        
        # Create the email content with interview slots
        subject = f"Interview Invitation: {job_title} Position"
        
        body = f"""Dear {candidate_name},

We are pleased to inform you that your profile has been shortlisted for the {job_title} position. Your qualifications and experience align well with what we're looking for.

We would like to invite you for an interview. Please select one of the following time slots that works best for you:

"""
        
        # Add the first 3 available slots
        for i, slot in enumerate(interview_slots[:3]):
            body += f"Option {i+1}: {slot['formatted']}\n"
            
        body += f"""
Please reply to this email with your preferred time slot, or suggest an alternative if none of these work for you.

The interview will be conducted via video call, and the details will be sent once you confirm your availability.

We look forward to speaking with you!

Best regards,
Recruitment Team"""
        
        return {
            "to": candidate_name,
            "email": self._generate_email_address(candidate_name),
            "subject": subject,
            "body": body,
            "slots": interview_slots[:3]
        }
        
    def _generate_email_address(self, name: str) -> str:
        """Generate a placeholder email address from a name"""
        # Convert to lowercase, replace spaces with dots, add domain
        email = name.lower().replace(" ", ".")
        return f"{email}@example.com"
        
    def send_interview_email(self, email_data: Dict) -> Dict:
        """Send an interview invitation email to a candidate"""
        from email_utils import send_email
        
        self.log_action("Sending interview email", {
            "to": email_data["to"],
            "email": email_data["email"]
        })
        
        # Call the email utility to send the email
        result = send_email(
            to_email=email_data["email"],
            subject=email_data["subject"],
            body=email_data["body"].replace("\n", "<br>")
        )
        
        self.log_action("Email sent", {"success": result["success"]})
        return result

class AgentCoordinator:
    """Coordinates the activities of all agents in the system"""
    def __init__(self):
        self.jd_agent = JDAnalyzerAgent()
        self.cv_agent = CVAnalyzerAgent()
        self.matching_agent = MatchingAgent()
        self.scheduler_agent = SchedulerAgent()
        self.logger = logging.getLogger("AgentCoordinator")
        
    def process_job_description(self, jd_text: str) -> Dict:
        """Process a job description using the JD agent"""
        self.logger.info("Starting job description processing")
        return self.jd_agent.analyze_jd(jd_text)
        
    def process_resumes(self, file_paths: List[tuple]) -> Dict[str, Dict]:
        """Process multiple resumes using the CV agent"""
        self.logger.info(f"Starting resume processing for {len(file_paths)} files")
        
        results = {}
        for filename, file_path in file_paths:
            results[filename] = self.cv_agent.process_cv(file_path, filename)
            
        return results
        
    def match_candidates(self, jd_data: Dict, cv_data: Dict[str, Dict]) -> Dict:
        """Match candidates with the job description"""
        self.logger.info("Starting candidate matching")
        return self.matching_agent.match_cvs_to_jd(jd_data, cv_data)
        
    def schedule_interviews(self, matches: List[Dict], job_title: str) -> List[Dict]:
        """Schedule interviews for matched candidates"""
        self.logger.info(f"Scheduling interviews for {len(matches)} candidates")
        
        email_data = []
        for candidate in matches:
            if candidate["isMatch"]:
                email_info = self.scheduler_agent.prepare_email_for_candidate(candidate, job_title)
                email_data.append(email_info)
                
        return email_data
        
    def execute_full_workflow(self, jd_text: str, resume_files: List[tuple]) -> Dict:
        """Execute the complete workflow from JD analysis to interview scheduling"""
        self.logger.info("Starting full recruitment workflow")
        
        # Step 1: Process the job description
        jd_result = self.process_job_description(jd_text)
        
        # Step 2: Process all resumes
        resume_results = self.process_resumes(resume_files)
        
        # Step 3: Match candidates with the job
        match_results = self.match_candidates(jd_result, resume_results)
        
        # Step 4: Schedule interviews for matched candidates
        email_data = self.schedule_interviews(match_results["matches"], jd_result["title"])
        
        return {
            "jd": jd_result,
            "resumes": resume_results,
            "matches": match_results,
            "emails": email_data
        }
