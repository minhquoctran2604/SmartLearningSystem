"""
Lesson service cho SmartLearn system.
Xử lý logic nghiệp vụ liên quan đến bài học và tiến độ học tập.
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from ..models.lesson import Lesson
from ..models.quiz import Quiz
from ..models.resource import Resource
from ..models.user_progress import UserProgress
from ..models.user_course_progress import UserCourseProgress
from ..models.user_lesson_progress import UserLessonProgress
from ..models.user import User
from ..schemas.lesson import LessonUpdate


class LessonService:
    """Service class để xử lý các nghiệp vụ liên quan đến bài học và tiến độ học tập."""

    @staticmethod
    def get_lesson(db: Session, lesson_id: int) -> Optional[Lesson]:
        """Lấy thông tin bài học theo ID."""
        return db.query(Lesson).filter(Lesson.id == lesson_id).first()
    
    @staticmethod
    def get_lessons_by_course(db: Session, course_id: int) -> List[Lesson]:
        """Lấy danh sách bài học theo khóa học."""
        return (
            db.query(Lesson)
            .filter(Lesson.course_id == course_id)
            .order_by(Lesson.order_index)
            .all()
        )
    
    @staticmethod
    def create_lesson(db: Session, lesson_data: dict) -> Lesson:
        """Tạo bài học mới."""
        lesson = Lesson(**lesson_data)
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        
        return lesson
    
    @staticmethod
    def update_lesson(
        db: Session, lesson_id: int, lesson_update: LessonUpdate
    ) -> Optional[Lesson]:
        """Cập nhật thông tin bài học."""
        lesson = LessonService.get_lesson(db, lesson_id)
        if lesson:
            for field, value in lesson_update.dict(exclude_unset=True).items():
                setattr(lesson, field, value)
            db.commit()
            db.refresh(lesson)
        return lesson
    
    @staticmethod
    def get_user_lesson_progress(
        db: Session, user_id: int, lesson_id: int
    ) -> Optional[UserLessonProgress]:
        """Lấy tiến độ học tập của user với lesson cụ thể."""
        return (
            db.query(UserLessonProgress)
            .filter(
                UserLessonProgress.user_id == user_id,
                UserLessonProgress.lesson_id == lesson_id,
            )
            .first()
        )
    
    @staticmethod
    def update_lesson_progress(
        db: Session, user_id: int, lesson_id: int, progress_data: dict
    ) -> UserLessonProgress:
        """Cập nhật tiến độ học tập của user với lesson."""
        
        # Get or create progress record
        progress = LessonService.get_user_lesson_progress(db, user_id, lesson_id)
        
        if not progress:
            progress = UserLessonProgress(
                user_id=user_id,
                lesson_id=lesson_id
            )
            db.add(progress)
        
        # Update progress fields
        for field, value in progress_data.items():
            setattr(progress, field, value)
        
        progress.last_accessed = datetime.utcnow()
        
        db.commit()
        db.refresh(progress)
        
        return progress
    
    @staticmethod
    def get_course_completion_percentage(
        db: Session, user_id: int, course_id: int
    ) -> float:
        """Tính phần trăm hoàn thành khóa học."""
        
        # Get total lessons in course
        total_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).count()
        
        if total_lessons == 0:
            return 0.0
        
        # Get completed lessons
        completed_lessons = (
            db.query(UserLessonProgress)
            .join(Lesson, UserLessonProgress.lesson_id == Lesson.id)
            .filter(
                and_(
                    UserLessonProgress.user_id == user_id,
                    Lesson.course_id == course_id,
                    UserLessonProgress.completed == True
                )
            )
            .count()
        )
        
        return round((completed_lessons / total_lessons) * 100, 2)