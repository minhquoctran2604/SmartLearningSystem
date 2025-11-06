# SmartLearn - AI-Powered Learning Management System

A complete learning management system with intelligent course recommendations, progress tracking, and YouTube integration.

## Features

### 🎯 Core Features
- **Smart Recommendations**: SVD-based collaborative filtering system
- **Progress Tracking**: Real-time video progress with YouTube API integration
- **Quiz System**: Interactive quizzes with automatic scoring
- **User Authentication**: JWT-based secure authentication
- **Responsive UI**: Modern React interface with Tailwind CSS

### 🏗️ Technical Stack
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **Frontend**: React 18, Vite, Tailwind CSS, YouTube API
- **ML Pipeline**: Surprise (SVD), pandas, numpy
- **Authentication**: JWT, bcrypt password hashing

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL

### Backend Setup
```bash
# Install Python dependencies
pip install -r smartlearn/requirements.txt

# Setup database
cp smartlearn/.env.example smartlearn/.env
# Edit .env with your database credentials

# Run migrations
cd smartlearn
alembic upgrade head

# Start backend
python run_server.py
```

### Frontend Setup
```bash
# Install dependencies
cd htkdtm_project/htkdtm_project
npm install

# Start development server
npm run dev
```

## API Documentation

After starting the backend, visit:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## ML Pipeline

### Training
```bash
cd smartlearn/ml_pipeline/scripts
python train_model.py
```

### Testing
```bash
python test_model.py
```

### Automated Retraining
- Windows: Run `setup_scheduler.ps1` as Administrator
- Schedule: Daily at 2:00 AM

## Project Structure

```
smartlearn/
├── api/              # FastAPI routers
├── models/           # SQLAlchemy models
├── services/         # Business logic
├── ml_pipeline/      # ML training scripts
├── schemas/          # Pydantic schemas
└── tests/           # Test suites

htkdtm_project/
└── htkdtm_project/
    ├── src/         # React components
    ├── pages/       # Route pages
    └── services/    # API services

specs/               # System specifications
scripts/            # Utility scripts
alembic/            # Database migrations
docs/              # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details.