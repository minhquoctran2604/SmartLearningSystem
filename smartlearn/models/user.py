"""
User model và các related models cho SmartLearn system.
Sử dụng SQLAlchemy 2.0 với modern syntax.
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy import Column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class User(Base):
    """User model đại diện cho sinh viên trong hệ thống."""

    __tablename__ = "users"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Basic information
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    # No relationships in the basic schema

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"

    def to_dict(self) -> dict:
        """Convert user object to dictionary cho API responses."""
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }