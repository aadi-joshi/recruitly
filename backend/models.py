from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, LargeBinary, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    
    job_descriptions = relationship("JobDescription", back_populates="user")
    resumes = relationship("Resume", back_populates="user")
    memories = relationship("ApplicationMemory", back_populates="user")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    embedding_data = Column(JSON)
    sections = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="job_descriptions")
    matches = relationship("Match", back_populates="job_description")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    candidate_name = Column(String, nullable=True)
    file_content = Column(LargeBinary)
    parsed_data = Column(JSON)
    embedding_data = Column(JSON)
    summary = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="resumes")
    matches = relationship("Match", back_populates="resume")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    score = Column(Float)
    is_match = Column(Boolean)
    reasoning = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    
    job_description = relationship("JobDescription", back_populates="matches")
    resume = relationship("Resume", back_populates="matches")
    interviews = relationship("Interview", back_populates="match")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    scheduled_time = Column(DateTime)
    email_sent = Column(Boolean, default=False)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    match = relationship("Match", back_populates="interviews")

class ApplicationMemory(Base):
    """Long-term memory storage for the application"""
    __tablename__ = "application_memories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, index=True)  # job_description, resume, match, interview, etc.
    reference_id = Column(Integer)  # ID of the referenced entity
    data = Column(JSON)  # Main data to store
    metadata = Column(JSON, nullable=True)  # Additional metadata
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="memories")
