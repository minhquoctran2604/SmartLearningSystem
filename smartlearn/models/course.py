"""
Course model cho SmartLearn system.
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, Integer, Text, DateTime, Boolean, ForeignKey
from sqlalchemy import Column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class Course(Base):
    """Course model đại diện cho khóa học trong hệ thống."""

    __tablename__ = "courses"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Basic information
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    difficulty_level = Column(String(50), nullable=True, index=True)
    
    # Media
    thumbnail_url = Column(String(500), nullable=True)
    
    # Settings
    is_published = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Statistics
    enrollment_count = Column(Integer, default=0, nullable=False)
    average_rating = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    lessons = relationship("Lesson", back_populates="course")
    user_progress = relationship("UserCourseProgress", back_populates="course")

    def __repr__(self) -> str:
        return f"<Course(id={self.id}, title='{self.title}', category='{self.category}')>"

    def to_dict(self) -> dict:
        """Convert course object to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "difficulty_level": self.difficulty_level,
            "thumbnail_url": self.thumbnail_url,
            "is_published": self.is_published,
            "is_active": self.is_active,
            "enrollment_count": self.enrollment_count,
            "average_rating": self.average_rating,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }