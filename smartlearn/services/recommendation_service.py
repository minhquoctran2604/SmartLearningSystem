"""
Recommendation service cho SmartLearn system.
SVD-based collaborative filtering recommendation engine.
"""

import pickle
import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from ..models.course import Course
from ..models.lesson import Lesson
from ..models.resource import Resource
from ..models.user_course_progress import UserCourseProgress
from ..models.user_progress import UserProgress
from ..models.interaction import Interaction

# ML model cache
_model_cache = None
_mappings_cache = None
_model_path = None
_mappings_path = None


def _load_model():
    """Load SVD model và ID mappings từ pickle files."""
    global _model_cache, _mappings_cache
    
    if _model_cache is not None:
        return _model_cache, _mappings_cache
    
    # Define model paths
    base_dir = os.path.dirname(__file__)
    models_dir = os.path.join(base_dir, "..", "ml_pipeline", "models")
    
    model_path = os.path.join(models_dir, "svd_model.pkl")
    mappings_path = os.path.join(models_dir, "mappings.pkl")
    
    try:
        # Load model
        with open(model_path, "rb") as f:
            _model_cache = pickle.load(f)
        
        # Load mappings
        with open(mappings_path, "rb") as f:
            _mappings_cache = pickle.load(f)
        
        print("✅ Model and mappings loaded successfully")
        return _model_cache, _mappings_cache
        
    except FileNotFoundError:
        print("⚠️ Model files not found. Please train the model first.")
        return None, None
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None, None


def get_popular_courses(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """Lấy danh sách khóa học phổ biến nhất."""
    
    courses = (
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
    
    return [
        {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "category": course.category,
            "difficulty_level": course.difficulty_level,
            "thumbnail_url": course.thumbnail_url,
            "enrollment_count": course.enrollment_count,
            "average_rating": course.average_rating
        }
        for course in courses
    ]


def get_popular_resources(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """Lấy danh sách tài nguyên phổ biến nhất."""
    
    resources = (
        db.query(Resource)
        .filter(Resource.resource_type != None)
        .order_by(Resource.id.asc())  # Fallback ordering
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": resource.id,
            "title": resource.title,
            "description": resource.description,
            "resource_type": resource.resource_type,
            "url": resource.url
        }
        for resource in resources
    ]


def get_personalized_recommendations(
    user_id: int, db: Session, limit: int = 10
) -> List[Dict[str, Any]]:
    """Lấy personalized recommendations cho user."""
    
    model, mappings = _load_model()
    
    if model is None or mappings is None:
        print("⚠️ Model not available, falling back to popular courses")
        return get_popular_courses(db, limit)
    
    try:
        # Get user enrolled courses
        enrolled_courses = (
            db.query(UserCourseProgress.course_id)
            .filter(UserCourseProgress.user_id == user_id)
            .all()
        )
        enrolled_ids = {course_id for course_id, in enrolled_courses}
        
        # Get all available courses
        all_courses = (
            db.query(Course)
            .filter(
                and_(
                    Course.is_active == True,
                    Course.is_published == True
                )
            )
            .all()
        )
        
        # Get user ID in model space
        user_encoder = mappings["user_encoder"]
        user_decoder = mappings["user_decoder"]
        item_encoder = mappings["item_encoder"]
        item_decoder = mappings["item_decoder"]
        
        # Get user index in model
        if user_id not in user_encoder:
            print(f"⚠️ User {user_id} not in training data, falling back")
            return get_popular_courses(db, limit)
        
        user_idx = user_encoder[user_id]
        
        # Predict ratings for all courses user hasn't enrolled
        recommendations = []
        
        for course in all_courses:
            if course.id not in enrolled_ids and course.id in item_encoder:
                item_idx = item_encoder[course.id]
                
                # Predict rating using SVD model
                prediction = model.predict(user_idx, item_idx)
                predicted_rating = prediction.est
                
                recommendations.append({
                    "id": course.id,
                    "title": course.title,
                    "description": course.description,
                    "category": course.category,
                    "difficulty_level": course.difficulty_level,
                    "thumbnail_url": course.thumbnail_url,
                    "predicted_rating": round(predicted_rating, 2)
                })
        
        # Sort by predicted rating and return top N
        recommendations.sort(key=lambda x: x["predicted_rating"], reverse=True)
        return recommendations[:limit]
        
    except Exception as e:
        print(f"❌ Error in personalized recommendations: {e}")
        return get_popular_courses(db, limit)