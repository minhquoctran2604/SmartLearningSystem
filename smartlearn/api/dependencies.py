"""
Common dependencies for FastAPI routes.

Bao gồm các dependency injection functions và utilities.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from smartlearn.core.database import get_db
from smartlearn.core.security import verify_token
from smartlearn.models.user import User

# Security scheme
security = HTTPBearer(auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Lấy current user từ JWT token.
    
    Args:
        db: Database session
        credentials: HTTP Authorization credentials
    
    Returns:
        User: Current user object
    
    Raises:
        HTTPException: Nếu token không hợp lệ hoặc user không tồn tại
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        token = credentials.credentials
        user_id = verify_token(token)
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is inactive"
            )
        
        return user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Lấy current active user.
    
    Args:
        current_user: Current user from get_current_user
    
    Returns:
        User: Active user object
    
    Raises:
        HTTPException: Nếu user không active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return current_user