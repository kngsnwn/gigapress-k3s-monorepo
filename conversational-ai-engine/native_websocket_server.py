#!/usr/bin/env python3
"""
Native WebSocket Server for GigaPress AI Engine
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from datetime import datetime
import asyncio
from typing import Dict, Any, Optional
import httpx
import json
from contextlib import asynccontextmanager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Connection tracking
connections: Dict[str, WebSocket] = {}

# Backend service URL for saving messages
BACKEND_SERVICE_URL = "http://localhost:8084"

# AI service URL (if using separate AI service)
AI_SERVICE_URL = "http://localhost:8001"

# Create HTTP client
http_client: Optional[httpx.AsyncClient] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global http_client
    http_client = httpx.AsyncClient(timeout=30.0)
    yield
    # Shutdown
    await http_client.aclose()

# Create FastAPI app
app = FastAPI(
    title="GigaPress AI Engine Native WebSocket",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "GigaPress AI Engine Native WebSocket Server",
        "status": "running",
        "connections": len(connections)
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "connections": len(connections),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.websocket("/api/v1/realtime/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Handle WebSocket connections"""
    await websocket.accept()
    connections[session_id] = websocket
    
    logger.info(f"Client {session_id} connected. Total connections: {len(connections)}")
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "session_id": session_id,
            "message": "Connected to GigaPress AI Engine",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Handle messages
        while True:
            try:
                # Receive message
                data = await websocket.receive_json()
                
                # Handle different message types
                msg_type = data.get('type', 'unknown')
                
                if msg_type == 'ping':
                    # Handle ping
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                elif msg_type == 'chat':
                    # Handle chat message
                    await handle_chat_message(websocket, session_id, data)
                    
                elif msg_type == 'project_action':
                    # Handle project actions
                    await handle_project_action(websocket, session_id, data)
                    
                else:
                    logger.warning(f"Unknown message type: {msg_type}")
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Unknown message type: {msg_type}"
                    })
                    
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Error handling message: {str(e)}")
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
                
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Clean up
        if session_id in connections:
            del connections[session_id]
        logger.info(f"Client {session_id} disconnected. Total connections: {len(connections)}")

async def save_message_to_database(message_data: Dict[str, Any]) -> bool:
    """Save message to database via backend service"""
    try:
        if not http_client:
            logger.error("HTTP client not initialized")
            return False
            
        response = await http_client.post(
            f"{BACKEND_SERVICE_URL}/api/chat/messages",
            json=message_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            logger.info(f"Message saved successfully: {message_data.get('messageId')}")
            return True
        else:
            logger.error(f"Failed to save message: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Error saving message to database: {str(e)}")
        return False

async def get_ai_response(content: str, context: Dict[str, Any]) -> str:
    """Get AI response from AI service or generate locally"""
    try:
        # Try to get response from AI service
        if http_client:
            try:
                response = await http_client.post(
                    f"{AI_SERVICE_URL}/api/v1/conversation/chat",
                    json={
                        "message": content,
                        "context": context
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "죄송합니다. 응답을 생성할 수 없습니다.")
            except:
                pass
        
        # Fallback to local response generation
        if "차량" in content and ("관리" in content or "서비스" in content):
            return """차량 관리 서비스를 만들어드리겠습니다! 🚗

**주요 기능:**
• 🚙 차량 정보 관리 (등록/수정/삭제)
• 📋 정비 이력 관리
• ⏰ 정비 일정 알림
• ⛽ 주유 기록 관리
• 📊 차량 운행 통계
• 💰 비용 관리 및 분석

**기술 스택:**
• Frontend: Next.js + TypeScript + Tailwind CSS
• Backend: FastAPI + Python
• Database: PostgreSQL
• Cache: Redis
• Notification: FCM (Firebase Cloud Messaging)

**추가 기능 제안:**
• 차량 사진 및 서류 관리
• QR코드 기반 차량 식별
• 정비소 연동 및 예약
• 차량 공유 기능 (가족/회사)

프로젝트를 시작하시겠습니까? 특별히 원하시는 기능이 있다면 말씀해주세요!"""
        
        elif "쇼핑몰" in content and ("만들어" in content or "개발" in content):
            return """네, 쇼핑몰 프로젝트를 생성해드리겠습니다! 🛍️

다음과 같은 기능을 포함한 쇼핑몰을 만들어드릴게요:

**주요 기능:**
• 📦 상품 관리 시스템  
• 🛒 장바구니 및 주문 처리
• 💳 결제 시스템 연동
• ⭐ 리뷰 및 평점 시스템
• 👤 회원 관리

**기술 스택:**
• Frontend: React + TypeScript
• Backend: Node.js + Express  
• Database: PostgreSQL
• Payment: 아임포트 연동

프로젝트 생성을 시작할까요? 원하시는 추가 기능이 있다면 말씀해주세요!"""
        
        else:
            return f"'{content}' 메시지를 받았습니다. 어떤 프로젝트를 만들어드릴까요? 예를 들어:\n\n• 🛍️ 쇼핑몰 서비스\n• 🚗 차량 관리 서비스\n• 📚 도서 관리 시스템\n• 🏥 병원 예약 시스템\n\n원하시는 서비스를 말씀해주세요!"
            
    except Exception as e:
        logger.error(f"Error getting AI response: {str(e)}")
        return "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요."

async def handle_chat_message(websocket: WebSocket, session_id: str, data: Dict[str, Any]):
    """Handle chat message"""
    content = data.get('message', '')
    context = data.get('context', {})
    project_id = context.get('projectId', 'default-project')
    user_id = context.get('userId', 'anonymous')
    
    logger.info(f"Processing chat message from {session_id}: {content[:100]}...")
    
    # Create user message data for database
    user_message_id = f"user-{session_id}-{int(datetime.utcnow().timestamp() * 1000)}"
    user_message_data = {
        'sessionId': session_id,
        'messageId': user_message_id,
        'role': 'USER',
        'content': content,
        'userId': user_id,
        'projectId': project_id,
        'status': 'SENT'
    }
    
    # Save user message to database (async, don't wait)
    asyncio.create_task(save_message_to_database(user_message_data))
    
    # Send typing indicator
    await websocket.send_json({
        "type": "typing",
        "isTyping": True
    })
    
    try:
        # Get AI response
        ai_response = await get_ai_response(content, context)
        
        # Stop typing
        await websocket.send_json({
            "type": "typing",
            "isTyping": False
        })
        
        # Create AI response data
        ai_message_id = f"ai-{session_id}-{int(datetime.utcnow().timestamp() * 1000)}"
        ai_message_data = {
            'sessionId': session_id,
            'messageId': ai_message_id,
            'role': 'ASSISTANT',
            'content': ai_response,
            'modelName': 'claude-3-sonnet-20240229',
            'userId': user_id,
            'projectId': project_id,
            'status': 'SENT'
        }
        
        # Save AI response to database (async)
        asyncio.create_task(save_message_to_database(ai_message_data))
        
        # Send response
        await websocket.send_json({
            "type": "chat_response",
            "id": ai_message_id,
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in chat handler: {str(e)}")
        
        # Stop typing on error
        await websocket.send_json({
            "type": "typing",
            "isTyping": False
        })
        
        # Send error message
        await websocket.send_json({
            "type": "error",
            "message": f"Failed to generate response: {str(e)}"
        })

async def handle_project_action(websocket: WebSocket, session_id: str, data: Dict[str, Any]):
    """Handle project-related actions"""
    action = data.get('action')
    payload = data.get('payload', {})
    
    logger.info(f"Processing project action from {session_id}: {action}")
    
    # TODO: Implement project action handling
    await websocket.send_json({
        "type": "project_update",
        "action": action,
        "status": "success",
        "timestamp": datetime.utcnow().isoformat()
    })

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8087,
        log_level="info"
    )