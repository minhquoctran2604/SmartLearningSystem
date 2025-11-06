"""
Train SVD model cho SmartLearn recommendation system.
Sử dụng Surprise library để train collaborative filtering model.
"""

import os
import pickle
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from surprise import SVD, Dataset, Reader, accuracy
from surprise.dump import dump

def load_training_data():
    """Load training data từ CSV files."""
    
    # Load interactions data
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "interactions.csv")
    
    if not os.path.exists(data_path):
        print("❌ Interactions data not found!")
        print("Please run export_training_data.py first to generate data.")
        return None
    
    try:
        df = pd.read_csv(data_path)
        print(f"✅ Loaded {len(df)} interactions from {data_path}")
        
        # Display basic statistics
        print(f"Users: {df['user_id'].nunique()}")
        print(f"Items: {df['item_id'].nunique()}")
        print(f"Interactions: {len(df)}")
        print(f"Rating range: {df['rating'].min()} - {df['rating'].max()}")
        
        return df
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return None

def create_mappings(df):
    """Tạo encoder/decoder mappings cho user và item IDs."""
    
    unique_users = df["user_id"].unique()
    unique_items = df["item_id"].unique()
    
    # Create mappings
    user_encoder = {uid: idx for idx, uid in enumerate(unique_users)}
    user_decoder = {idx: uid for uid, idx in user_encoder.items()}
    item_encoder = {iid: idx for idx, iid in enumerate(unique_items)}
    item_decoder = {idx: iid for iid, idx in item_encoder.items()}
    
    print(f"✅ Created mappings: {len(user_encoder)} users, {len(item_encoder)} items")
    
    return {
        "user_encoder": user_encoder,
        "user_decoder": user_decoder,
        "item_encoder": item_encoder,
        "item_decoder": item_decoder
    }

def train_svd_model(df, mappings):
    """Train SVD model với Surprise library."""
    
    # Prepare data for Surprise
    reader = Reader(rating_scale=(1.0, 5.0))
    data = Dataset.load_from_df(df[["user_id", "item_id", "rating"]], reader)
    
    # Split data
    trainset, testset = train_test_split(data, test_size=0.2, random_state=42)
    
    # Train SVD model
    print("\n🚀 Training SVD model...")
    
    # SVD parameters
    algo = SVD(
        n_factors=50,  # Number of latent factors
        n_epochs=20,   # Number of training epochs
        lr_all=0.005,  # Learning rate for all parameters
        reg_all=0.02   # Regularization term for all parameters
    )
    
    # Fit model
    algo.fit(trainset)
    
    # Test model
    print("\n📊 Evaluating model...")
    predictions = algo.test(testset)
    
    # Calculate metrics
    rmse = accuracy.rmse(predictions)
    mae = accuracy.mae(predictions)
    
    print(f"\n✅ Model trained successfully!")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE: {mae:.4f}")
    
    return algo, rmse, mae

def save_model_and_mappings(algo, mappings, rmse, mae):
    """Save trained model và mappings."""
    
    # Create models directory
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(models_dir, "svd_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(algo, f)
    
    # Save mappings
    mappings_path = os.path.join(models_dir, "mappings.pkl")
    with open(mappings_path, "wb") as f:
        pickle.dump(mappings, f)
    
    # Save training info
    info = {
        "rmse": rmse,
        "mae": mae,
        "n_users": len(mappings["user_encoder"]),
        "n_items": len(mappings["item_encoder"]),
        "trained_at": pd.Timestamp.now().isoformat()
    }
    
    info_path = os.path.join(models_dir, "training_info.pkl")
    with open(info_path, "wb") as f:
        pickle.dump(info, f)
    
    print(f"\n💾 Model saved to: {model_path}")
    print(f"💾 Mappings saved to: {mappings_path}")
    print(f"💾 Training info saved to: {info_path}")

def main():
    """Main training function."""
    
    print("🎯 SmartLearn SVD Model Training")
    print("=" * 50)
    
    # Load data
    df = load_training_data()
    if df is None:
        return
    
    # Create mappings
    mappings = create_mappings(df)
    
    # Train model
    algo, rmse, mae = train_svd_model(df, mappings)
    
    # Save model and mappings
    save_model_and_mappings(algo, mappings, rmse, mae)
    
    print("\n🎉 Training completed successfully!")
    print("\n📋 Model is ready for recommendations!")

if __name__ == "__main__":
    main()