"""
Course service cho SmartLearn system.
Xử lý các nghiệp vụ liên quan đến khóa học.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from ..models.course import Course
from ..models.user_course_progress import UserCourseProgress
from ..models.user import User
from ..schemas.course import CourseCreate, CourseUpdate


class CourseService:
    """Service class để xử lý các nghiệp vụ liên quan đến khóa học."""

    @staticmethod
    def create_course(db: Session, course_data: CourseCreate) -> Course:
        """Tạo khóa học mới."""
        course = Course(
            title=course_data.title,
            description=course_data.description,
            category=course_data.category,
            difficulty_level=course_data.difficulty_level,
            thumbnail_url=course_data.thumbnail_url,
            is_published=course_data.is_published,
            is_active=True
        )
        
        db.add(course)
        db.commit()
        db.refresh(course)
        
        return course
    
    @staticmethod
    def get_course(db: Session, course_id: int) -> Optional[Course]:
        """Lấy thông tin khóa học theo ID."""
        return db.query(Course).filter(Course.id == course_id).first()
    
    @staticmethod
    def get_courses(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        category: Optional[str] = None,
        difficulty_level: Optional[str] = None
    ) -> List[Course]:
        """Lấy danh sách khóa học với pagination và filter."""
        query = db.query(Course).filter(Course.is_active == True)
        
        if category:
            query = query.filter(Course.category == category)
        
        if difficulty_level:
            query = query.filter(Course.difficulty_level == difficulty_level)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update_course(
        db: Session, course_id: int, course_data: CourseUpdate
    ) -> Optional[Course]:
        """Cập nhật thông tin khóa học."""
        course = CourseService.get_course(db, course_id)
        
        if not course:
            return None
        
        # Update fields
        update_data = course_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(course, field, value)
        
        db.commit()
        db.refresh(course)
        
        return course
    
    @staticmethod
    def delete_course(db: Session, course_id: int) -> bool:
        """Xóa khóa học (soft delete)."""
        course = CourseService.get_course(db, course_id)
        
        if not course:
            return False
        
        course.is_active = False
        db.commit()
        
        return True
    
    @staticmethod
    def get_popular_courses(db: Session, limit: int = 10) -> List[Course]:
        """Lấy danh sách khóa học phổ biến nhất."""
        return (
            db.query(Course)
            .filter(
                and_(
                    Course.is_active == True,
                    Course.is_published == True
                )
            )
            .order_by(Course.enrollment_count.desc())
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def increment_enrollment(db: Session, course_id: int) -> None:
        """Tăng enrollment count cho khóa học."""
        course = CourseService.get_course(db, course_id)
        
        if course:
            course.enrollment_count += 1
            db.commit()