"""
Lesson model cho SmartLearn system.
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, Integer, Text, DateTime, Boolean, ForeignKey
from sqlalchemy import Column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class Lesson(Base):
    """Lesson model đại diện cho bài học trong khóa học."""

    __tablename__ = "lessons"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)

    # Basic information
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False, index=True)
    
    # Video content
    video_url = Column(String(500), nullable=True)
    video_duration = Column(Integer, nullable=True)  # Duration in seconds
    
    # Reading content
    reading_content = Column(Text, nullable=True)
    
    # Quiz
    has_quiz = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    course = relationship("Course", back_populates="lessons")
    quiz = relationship("Quiz", uselist=False, back_populates="lesson")
    user_lesson_progress = relationship("UserLessonProgress", back_populates="lesson")

    def __repr__(self) -> str:
        return f"<Lesson(id={self.id}, title='{self.title}', course_id={self.course_id})>"

    def to_dict(self) -> dict:
        """Convert lesson object to dictionary."""
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "description": self.description,
            "order_index": self.order_index,
            "video_url": self.video_url,
            "video_duration": self.video_duration,
            "has_quiz": self.has_quiz,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }