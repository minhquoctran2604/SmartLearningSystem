"""
Test SVD model cho SmartLearn recommendation system.
Kiểm tra model performance và generate sample recommendations.
"""

import pickle
import os
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
from surprise import SVD, Dataset, Reader
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Mock data for testing if no database
MOCK_USERS = [1, 2, 3, 4, 5]
MOCK_COURSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

def load_model():
    """Load trained SVD model."""
    
    # Try to load from actual model file first
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    model_path = os.path.join(models_dir, "svd_model.pkl")
    mappings_path = os.path.join(models_dir, "mappings.pkl")
    
    if os.path.exists(model_path) and os.path.exists(mappings_path):
        try:
            # Load model
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            
            # Load mappings
            with open(mappings_path, "rb") as f:
                mappings = pickle.load(f)
            
            print("✅ Loaded model from file")
            return model, mappings, True
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    # Create mock model for testing
    print("⚠️ Model file not found, creating mock model for testing")
    
    # Create mock SVD model
    model = SVD(n_factors=10, n_epochs=5)
    
    # Create mock data
    data = []
    for user_id in MOCK_USERS:
        for course_id in MOCK_COURSES:
            # Generate mock ratings (3.0 to 5.0)
            import random
            rating = random.uniform(3.0, 5.0)
            data.append([user_id, course_id, rating])
    
    df = pd.DataFrame(data, columns=["user_id", "item_id", "rating"])
    
    # Train model on mock data
    reader = Reader(rating_scale=(1.0, 5.0))
    dataset = Dataset.load_from_df(df, reader)
    trainset = dataset.build_full_trainset()
    model.fit(trainset)
    
    # Create mock mappings
    mappings = {
        "user_encoder": {uid: i for i, uid in enumerate(MOCK_USERS)},
        "user_decoder": {i: uid for uid, i in enumerate(MOCK_USERS)},
        "item_encoder": {iid: i for i, iid in enumerate(MOCK_COURSES)},
        "item_decoder": {i: iid for iid, i in enumerate(MOCK_COURSES)}
    }
    
    return model, mappings, False

def test_model_predictions(model, mappings, is_real_model):
    """Test model predictions."""
    
    print("\n🧪 Testing Model Predictions")
    print("-" * 40)
    
    if is_real_model:
        # Test with real users/items from mappings
        test_users = list(mappings["user_encoder"].keys())[:3]
        test_items = list(mappings["item_encoder"].keys())[:3]
    else:
        # Test with mock data
        test_users = MOCK_USERS[:3]
        test_items = MOCK_COURSES[:3]
    
    print("Sample predictions:")
    for user_id in test_users:
        if user_id not in mappings["user_encoder"]:
            continue
            
        user_idx = mappings["user_encoder"][user_id]
        
        predictions = []
        for item_id in test_items:
            if item_id in mappings["item_encoder"]:
                item_idx = mappings["item_encoder"][item_id]
                prediction = model.predict(user_idx, item_idx)
                predicted_rating = prediction.est
                predictions.append((item_id, predicted_rating))
        
        if predictions:
            print(f"User {user_id}:")
            for item_id, rating in predictions[:3]:
                print(f"  Item {item_id}: {rating:.2f}")
            print()

def get_recommendations(user_id, model, mappings, n=5):
    """Get top N recommendations for a user."""
    
    if user_id not in mappings["user_encoder"]:
        return []
    
    user_idx = mappings["user_encoder"][user_id]
    
    # Get all items
    all_items = list(mappings["item_encoder"].keys())
    
    # Predict ratings for all items
    recommendations = []
    for item_id in all_items:
        item_idx = mappings["item_encoder"][item_id]
        prediction = model.predict(user_idx, item_idx)
        predicted_rating = prediction.est
        recommendations.append((item_id, predicted_rating))
    
    # Sort by rating and return top N
    recommendations.sort(key=lambda x: x[1], reverse=True)
    return recommendations[:n]

def test_recommendations(model, mappings, is_real_model):
    """Test recommendation system."""
    
    print("\n🎯 Testing Recommendations")
    print("-" * 40)
    
    if is_real_model:
        test_users = list(mappings["user_encoder"].keys())[:3]
    else:
        test_users = MOCK_USERS[:3]
    
    for user_id in test_users:
        recommendations = get_recommendations(user_id, model, mappings)
        
        if recommendations:
            print(f"Top 5 recommendations for User {user_id}:")
            for i, (item_id, rating) in enumerate(recommendations, 1):
                print(f"  {i}. Item {item_id}: {rating:.2f}")
            print()

def test_backend_integration():
    """Test integration with backend services."""
    
    print("\n🔗 Testing Backend Integration")
    print("-" * 40)
    
    try:
        # Import backend services (mock for testing)
        from smartlearn.services.recommendation_service import (
            _load_model, get_popular_courses, get_personalized_recommendations
        )
        
        print("✅ Backend services imported successfully")
        
        # Test loading model through service
        model, mappings = _load_model()
        if model and mappings:
            print("✅ Model loaded through service layer")
        else:
            print("⚠️ Model not available through service layer")
        
        return True
        
    except ImportError as e:
        print(f"⚠️ Could not import backend services: {e}")
        print("This is expected if running standalone")
        return False
    except Exception as e:
        print(f"❌ Backend integration error: {e}")
        return False

def main():
    """Main testing function."""
    
    print("🎯 SmartLearn SVD Model Testing")
    print("=" * 50)
    
    # Load model
    model, mappings, is_real_model = load_model()
    
    if model is None or mappings is None:
        print("❌ Failed to load model")
        return
    
    print(f"Model type: {'Real' if is_real_model else 'Mock'}")
    print(f"Users: {len(mappings['user_encoder'])}")
    print(f"Items: {len(mappings['item_encoder'])}")
    
    # Test predictions
    test_model_predictions(model, mappings, is_real_model)
    
    # Test recommendations
    test_recommendations(model, mappings, is_real_model)
    
    # Test backend integration
    test_backend_integration()
    
    print("\n🎉 Testing completed!")
    
    if is_real_model:
        print("\n📋 Model is ready for production use!")
    else:
        print("\n📋 Mock model created for testing purposes")
        print("To use real model, please run train_model.py first")

if __name__ == "__main__":
    main()