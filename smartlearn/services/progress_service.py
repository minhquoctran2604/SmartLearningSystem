"""
Progress service cho SmartLearn system.
Xử lý tiến độ học tập của user.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models.course import Course
from ..models.lesson import Lesson
from ..models.resource import Resource
from ..models.user_course_progress import UserCourseProgress
from ..models.user_lesson_progress import UserLessonProgress
from ..models.user_progress import UserProgress
from ..models.user import User


class ProgressService:
    """Service class để xử lý tiến độ học tập."""

    @staticmethod
    def get_user_course_progress(
        db: Session, user_id: int, course_id: int
    ) -> Dict[str, Any]:
        """Lấy tiến độ học tập của user với khóa học."""
        
        # Get course
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return {}
        
        # Get total lessons
        total_lessons = (
            db.query(Lesson)
            .filter(Lesson.course_id == course_id)
            .count()
        )
        
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
        
        # Calculate percentage
        completion_percentage = 0
        if total_lessons > 0:
            completion_percentage = round((completed_lessons / total_lessons) * 100, 2)
        
        return {
            "course_id": course_id,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "completion_percentage": completion_percentage,
            "course_title": course.title
        }
    
    @staticmethod
    def get_user_all_progress(db: Session, user_id: int) -> List[Dict[str, Any]]:
        """Lấy tiến độ của user với tất cả khóa học."""
        
        # Get courses user is enrolled in
        user_courses = (
            db.query(UserCourseProgress)
            .filter(UserCourseProgress.user_id == user_id)
            .all()
        )
        
        progress_list = []
        for user_course in user_courses:
            progress = ProgressService.get_user_course_progress(
                db, user_id, user_course.course_id
            )
            progress_list.append(progress)
        
        return progress_list
    
    @staticmethod
    def enroll_in_course(db: Session, user_id: int, course_id: int) -> None:
        """Đăng ký user vào khóa học."""
        
        # Check if already enrolled
        existing = (
            db.query(UserCourseProgress)
            .filter(
                and_(
                    UserCourseProgress.user_id == user_id,
                    UserCourseProgress.course_id == course_id
                )
            )
            .first()
        )
        
        if not existing:
            # Create new enrollment
            enrollment = UserCourseProgress(
                user_id=user_id,
                course_id=course_id
            )
            db.add(enrollment)
            db.commit()
            
            # Update course enrollment count
            course = db.query(Course).filter(Course.id == course_id).first()
            if course:
                course.enrollment_count += 1
                db.commit()
    
    @staticmethod
    def complete_lesson(
        db: Session, user_id: int, lesson_id: int
    ) -> None:
        """Đánh dấu lesson hoàn thành."""
        
        # Get lesson
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            return
        
        # Get or create lesson progress
        progress = (
            db.query(UserLessonProgress)
            .filter(
                and_(
                    UserLessonProgress.user_id == user_id,
                    UserLessonProgress.lesson_id == lesson_id
                )
            )
            .first()
        )
        
        if not progress:
            progress = UserLessonProgress(
                user_id=user_id,
                lesson_id=lesson_id
            )
            db.add(progress)
        
        # Mark as completed
        progress.completed = True
        progress.video_completed = True
        progress.reading_accessed = True
        
        db.commit()
        
        # Check if course is fully completed
        ProgressService.check_course_completion(db, user_id, lesson.course_id)
    
    @staticmethod
    def check_course_completion(db: Session, user_id: int, course_id: int) -> None:
        """Kiểm tra xem user đã hoàn thành khóa học chưa."""
        
        # Get total lessons in course
        total_lessons = (
            db.query(Lesson)
            .filter(Lesson.course_id == course_id)
            .count()
        )
        
        if total_lessons == 0:
            return
        
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
        
        # Update course progress if fully completed
        if completed_lessons >= total_lessons:
            course_progress = (
                db.query(UserCourseProgress)
                .filter(
                    and_(
                        UserCourseProgress.user_id == user_id,
                        UserCourseProgress.course_id == course_id
                    )
                )
                .first()
            )
            
            if course_progress and not course_progress.completed_at:
                from datetime import datetime
                course_progress.completed_at = datetime.utcnow()
                db.commit()