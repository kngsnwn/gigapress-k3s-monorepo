from fastapi import APIRouter
from app.api.endpoints import health, conversation, ai_info

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["Conversation"])
api_router.include_router(ai_info.router, prefix="/api", tags=["AI Info"])

# Add WebSocket endpoints
from app.api.endpoints import websocket
api_router.include_router(
    websocket.router,
    prefix="/realtime",
    tags=["WebSocket"]
)
