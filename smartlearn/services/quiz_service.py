"""
Quiz service cho SmartLearn system.
Xử lý nghiệp vụ liên quan đến quiz.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models.quiz import Quiz
from ..models.quiz_attempt import QuizAttempt
from ..models.user_lesson_progress import UserLessonProgress
from ..models.user import User
from ..schemas.quiz import QuizCreate, QuizAttemptCreate


class QuizService:
    """Service class để xử lý các nghiệp vụ liên quan đến quiz."""

    @staticmethod
    def get_quiz(db: Session, quiz_id: int) -> Optional[Quiz]:
        """Lấy thông tin quiz theo ID."""
        return db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    @staticmethod
    def get_quiz_by_lesson(db: Session, lesson_id: int) -> Optional[Quiz]:
        """Lấy quiz của lesson."""
        return db.query(Quiz).filter(Quiz.lesson_id == lesson_id).first()
    
    @staticmethod
    def create_quiz(db: Session, quiz_data: QuizCreate) -> Quiz:
        """Tạo quiz mới."""
        quiz = Quiz(
            lesson_id=quiz_data.lesson_id,
            title=quiz_data.title,
            description=quiz_data.description,
            questions=quiz_data.questions
        )
        
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        return quiz
    
    @staticmethod
    def submit_quiz(
        db: Session, quiz_id: int, user_id: int, answers: List[int]
    ) -> Dict[str, Any]:
        """Submit quiz và tính điểm."""
        
        # Get quiz
        quiz = QuizService.get_quiz(db, quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}
        
        # Get questions
        questions = quiz.questions or []
        
        if len(answers) != len(questions):
            return {"error": "Invalid number of answers"}
        
        # Calculate score
        correct_answers = 0
        for i, answer in enumerate(answers):
            if i < len(questions) and answer == questions[i]["correct_answer"]:
                correct_answers += 1
        
        score = int((correct_answers / len(questions)) * 100) if questions else 0
        passed = score >= 70  # Pass threshold is 70%
        
        # Create quiz attempt record
        quiz_attempt = QuizAttempt(
            quiz_id=quiz_id,
            user_id=user_id,
            answers=answers,
            score=score,
            passed=passed
        )
        
        db.add(quiz_attempt)
        
        # Update lesson progress
        lesson_progress = (
            db.query(UserLessonProgress)
            .filter(
                and_(
                    UserLessonProgress.user_id == user_id,
                    UserLessonProgress.lesson_id == quiz.lesson_id
                )
            )
            .first()
        )
        
        if lesson_progress:
            lesson_progress.quiz_score = score
            lesson_progress.quiz_passed = passed
        
        db.commit()
        db.refresh(quiz_attempt)
        
        return {
            "quiz_id": quiz_id,
            "score": score,
            "passed": passed,
            "correct_answers": correct_answers,
            "total_questions": len(questions),
            "attempt_id": quiz_attempt.id
        }
    
    @staticmethod
    def get_user_quiz_attempts(
        db: Session, user_id: int, quiz_id: Optional[int] = None
    ) -> List[QuizAttempt]:
        """Lấy lịch sử làm quiz của user."""
        
        query = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id)
        
        if quiz_id:
            query = query.filter(QuizAttempt.quiz_id == quiz_id)
        
        return query.order_by(QuizAttempt.submitted_at.desc()).all()
    
    @staticmethod
    def get_best_score(db: Session, user_id: int, quiz_id: int) -> Optional[int]:
        """Lấy điểm cao nhất của user trong quiz."""
        
        best_attempt = (
            db.query(QuizAttempt)
            .filter(
                and_(
                    QuizAttempt.user_id == user_id,
                    QuizAttempt.quiz_id == quiz_id
                )
            )
            .order_by(QuizAttempt.score.desc())
            .first()
        )
        
        return best_attempt.score if best_attempt else None