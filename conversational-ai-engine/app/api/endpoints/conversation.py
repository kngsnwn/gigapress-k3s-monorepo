from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
import time
import logging

from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter()


class ConversationRequest(BaseModel):
    """Conversation request model"""
    message: str = Field(..., description="User message")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Session ID")
    context: Dict[str, Any] = Field(default_factory=dict, description="Additional context")


class ConversationResponse(BaseModel):
    """Conversation response model"""
    response: str = Field(..., description="AI response")
    session_id: str = Field(..., description="Session ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


@router.post("/process", response_model=ConversationResponse)
async def process_conversation(request: ConversationRequest) -> ConversationResponse:
    """Process a conversation message - main endpoint for frontend"""
    try:
        start_time = time.time()
        logger.info(f"Processing message from session {request.session_id}: {request.message[:100]}...")
        
        # Generate AI response
        response = await ai_service.generate_response(
            user_message=request.message,
            conversation_history=request.context.get("history", []),
            stream=False
        )
        
        processing_time = time.time() - start_time
        provider_info = ai_service.get_provider_info()
        
        logger.info(f"Generated response in {processing_time:.2f}s using {provider_info['current_provider']}")
        
        return ConversationResponse(
            response=response,
            session_id=request.session_id,
            metadata={
                "provider": provider_info["current_provider"],
                "available_providers": provider_info["available_providers"],
                "processing_time": processing_time,
                "tokens": len(request.message.split()),
                "response_tokens": len(str(response).split())
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing conversation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process conversation: {str(e)}"
        )


@router.post("/chat", response_model=ConversationResponse)
async def chat(request: ConversationRequest) -> ConversationResponse:
    """Process a conversation message - legacy endpoint"""
    return await process_conversation(request)


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> Dict[str, Any]:
    """Get session information"""
    # Placeholder implementation
    return {
        "session_id": session_id,
        "created_at": datetime.utcnow().isoformat(),
        "messages": [],
        "context": {}
    }


@router.delete("/sessions/{session_id}")
async def clear_session(session_id: str) -> Dict[str, str]:
    """Clear a conversation session"""
    # Placeholder implementation
    return {
        "message": f"Session {session_id} cleared",
        "status": "success"
    }
