"""
Main FastAPI application cho SmartLearn system.
Khởi tạo app với tất cả routers, middleware, và configuration.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from smartlearn.core.config import settings, get_cors_origins
from smartlearn.core.database import create_tables, get_database_info
from smartlearn.api.routers import auth
from smartlearn.api.routers import course
from smartlearn.api.routers import interaction
from smartlearn.api.routers import lesson
from smartlearn.api.routers import progress
from smartlearn.api.routers import quiz
from smartlearn.api.routers import recommendation
from smartlearn.api.routers import resource
from smartlearn.api.routers import search


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager cho FastAPI app.
    Xử lý startup và shutdown events.
    """
    # Startup
    print("Starting SmartLearn API...")
    print(f"Database: {get_database_info()}")

    # Tạo database tables nếu chưa tồn tại
    try:
        create_tables()
        print("Database tables created/verified")
    except Exception as e:
        print(f"Database setup error: {e}")
        raise

    yield

    # Shutdown
    print("Shutting down SmartLearn API...")


def create_application() -> FastAPI:
    """Tạo và cấu hình FastAPI application."""
    app = FastAPI(
        title="SmartLearn API",
        description="AI-Powered Learning Management System with SVD Recommendations",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Trusted Host Middleware (Security)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["127.0.0.1", "localhost", "*.localhost"],
    )

    # Exception handler cho unhandled errors
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        print(f"Global exception: {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

    # Include API routers
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(course.router, prefix="/api/courses", tags=["Courses"])
    app.include_router(lesson.router, prefix="/api/lessons", tags=["Lessons"])
    app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
    app.include_router(quiz.router, prefix="/api/quizzes", tags=["Quizzes"])
    app.include_router(recommendation.router, prefix="/api/recommendations", tags=["Recommendations"])
    app.include_router(resource.router, prefix="/api/resources", tags=["Resources"])
    app.include_router(search.router, prefix="/api/search", tags=["Search"])
    app.include_router(interaction.router, prefix="/api/interactions", tags=["Interactions"])

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": "SmartLearn API",
            "version": "1.0.0"
        }

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)