#!/usr/bin/env python3
"""
Standalone SocketIO Server for GigaPress AI Engine
"""

import socketio
import uvicorn
from fastapi import FastAPI
import logging
from datetime import datetime
import asyncio
from typing import Dict, Any, Optional
import httpx
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Create FastAPI app
app = FastAPI(title="GigaPress AI Engine SocketIO")

# Connection tracking
connections = {}

# Backend service URL for saving messages
BACKEND_SERVICE_URL = "http://localhost:8084"

# HTTP client for backend requests
http_client = httpx.AsyncClient(timeout=30.0)

@sio.event
async def connect(sid, environ, auth=None):
    """Handle client connection"""
    connections[sid] = {
        'connected_at': datetime.utcnow(),
        'last_activity': datetime.utcnow()
    }
    
    logger.info(f"Client {sid} connected. Total connections: {len(connections)}")
    
    # Send welcome message
    await sio.emit('connected', {
        'message': 'Connected to GigaPress AI Engine',
        'sessionId': sid,
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'success'
    }, room=sid)
    
    return True

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    if sid in connections:
        del connections[sid]
    
    logger.info(f"Client {sid} disconnected. Total connections: {len(connections)}")

@sio.event
async def message(sid, data):
    """Handle message from client"""
    logger.info(f"Message from {sid}: {data}")
    
    # Update activity
    if sid in connections:
        connections[sid]['last_activity'] = datetime.utcnow()
    
    try:
        # Handle different message types
        msg_type = data.get('type', 'unknown')
        payload = data.get('payload', {})
        
        if msg_type == 'user_message':
            await handle_user_message(sid, payload)
        elif msg_type == 'ping':
            await sio.emit('pong', {'timestamp': datetime.utcnow().isoformat()}, room=sid)
        else:
            logger.warning(f"Unknown message type: {msg_type}")
            
    except Exception as e:
        logger.error(f"Error handling message: {str(e)}")
        await sio.emit('error', {
            'message': 'Failed to process message',
            'error': str(e)
        }, room=sid)

async def save_message_to_database(message_data: Dict[str, Any]) -> bool:
    """Save message to database via backend service"""
    try:
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

async def handle_user_message(sid: str, payload: Dict[str, Any]):
    """Handle user chat message"""
    content = payload.get('content', '')
    project_id = payload.get('projectId', 'default-project')
    user_id = payload.get('userId', 'anonymous')
    
    logger.info(f"Processing user message: {content[:100]}...")
    
    # Create user message data for database
    user_message_id = f"user-{sid}-{int(datetime.utcnow().timestamp() * 1000)}"
    user_message_data = {
        'sessionId': sid,
        'messageId': user_message_id,
        'role': 'USER',
        'content': content,
        'userId': user_id,
        'projectId': project_id,
        'status': 'SENT'
    }
    
    # Save user message to database
    await save_message_to_database(user_message_data)
    
    # Send typing indicator
    await sio.emit('typing', {'isTyping': True}, room=sid)
    
    # Simulate processing
    await asyncio.sleep(1)
    
    # Generate response
    if "쇼핑몰" in content and ("만들어" in content or "개발" in content):
        ai_response = """네, 쇼핑몰 프로젝트를 생성해드리겠습니다! 🛍️

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
        ai_response = f"안녕하세요! '{content}' 메시지를 받았습니다. 어떤 도움이 필요하신가요?"
    
    # Create AI response data for database
    ai_message_id = f"ai-{sid}-{int(datetime.utcnow().timestamp() * 1000)}"
    ai_message_data = {
        'sessionId': sid,
        'messageId': ai_message_id,
        'role': 'ASSISTANT',
        'content': ai_response,
        'modelName': 'claude-3-sonnet-20240229',
        'userId': user_id,
        'projectId': project_id,
        'status': 'SENT'
    }
    
    # Save AI response to database
    await save_message_to_database(ai_message_data)
    
    # Stop typing
    await sio.emit('typing', {'isTyping': False}, room=sid)
    
    # Send response
    response_data = {
        'type': 'message',
        'payload': {
            'id': ai_message_id,
            'role': 'assistant',
            'content': ai_response,
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'sent'
        }
    }
    
    await sio.emit('message', response_data, room=sid)

@app.get("/")
async def root():
    return {
        "message": "GigaPress AI Engine SocketIO Server",
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

# Create Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    uvicorn.run(
        socket_app,
        host="0.0.0.0",
        port=8088,
        log_level="info"
    )