"""
AI Service Information API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/ai/info")
async def get_ai_info() -> Dict[str, Any]:
    """Get AI service information"""
    try:
        return ai_service.get_provider_info()
    except Exception as e:
        logger.error(f"Failed to get AI info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai/health")
async def check_ai_health() -> Dict[str, Any]:
    """Check AI service health"""
    try:
        provider_info = ai_service.get_provider_info()
        
        # Test AI service with a simple message
        test_response = await ai_service.generate_response(
            user_message="Hello, this is a health check test.",
            stream=False
        )
        
        return {
            "status": "healthy",
            "provider_info": provider_info,
            "test_response_length": len(test_response) if isinstance(test_response, str) else 0,
            "timestamp": "2025-01-31T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"AI health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "provider_info": ai_service.get_provider_info(),
            "timestamp": "2025-01-31T00:00:00Z"
        }


@router.post("/ai/test")
async def test_ai_generation(
    message: str = "안녕하세요, 테스트 메시지입니다."
) -> Dict[str, Any]:
    """Test AI generation with a custom message"""
    try:
        response = await ai_service.generate_response(
            user_message=message,
            stream=False
        )
        
        return {
            "success": True,
            "request_message": message,
            "response": response,
            "provider_info": ai_service.get_provider_info(),
            "response_length": len(response) if isinstance(response, str) else 0
        }
        
    except Exception as e:
        logger.error(f"AI test generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(e),
                "provider_info": ai_service.get_provider_info()
            }
        )