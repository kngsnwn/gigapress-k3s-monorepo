import socketio
import logging
import asyncio
from typing import Dict, Any
import json
import re

logger = logging.getLogger(__name__)

async def process_user_message(content: str, project_id: str = None) -> str:
    """Process user message and generate AI response"""
    
    # Detect Korean language and shopping mall request
    if "쇼핑몰" in content and ("만들어" in content or "개발" in content):
        return await generate_shopping_mall_response(content)
    
    # Default processing for other requests
    return await generate_default_response(content)

async def generate_shopping_mall_response(content: str) -> str:
    """Generate response for shopping mall development request"""
    
    # Extract requirements from the message
    features = []
    if "카탈로그" in content or "상품" in content:
        features.append("상품 카탈로그")
    if "리뷰" in content or "후기" in content:
        features.append("리뷰 시스템")
    if "결제" in content:
        features.append("결제 시스템")
    if "장바구니" in content:
        features.append("장바구니")
    
    features_text = ", ".join(features) if features else "기본 쇼핑몰 기능"
    
    response = f"""쇼핑몰 개발 요청을 받았습니다! 

요청하신 기능: {features_text}

개발 계획:
1. 🛍️ 상품 카탈로그 시스템
   - 상품 목록 및 상세 페이지
   - 카테고리 분류
   - 검색 기능

2. ⭐ 리뷰 시스템
   - 별점 평가
   - 리뷰 작성/수정/삭제
   - 리뷰 필터링

3. 🛒 쇼핑 기능
   - 장바구니
   - 주문 관리
   - 결제 연동

4. 👤 사용자 관리
   - 회원 가입/로그인
   - 주문 내역
   - 개인정보 관리

기술 스택: React, Node.js, MongoDB
예상 개발 기간: 2-3주

프로젝트를 시작하시겠습니까?"""
    
    return response

async def generate_default_response(content: str) -> str:
    """Generate default AI response"""
    return f"안녕하세요! '{content}' 요청을 이해했습니다. 더 구체적인 요구사항을 알려주시면 더 나은 도움을 드릴 수 있습니다."

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode="asgi",
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25,
    max_http_buffer_size=1000000
)

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    logger.info(f"Socket.IO client connected: {sid}")
    await sio.emit('welcome', {'message': 'Connected to GigaPress AI Engine'}, room=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Socket.IO client disconnected: {sid}")

@sio.event
async def message(sid, data):
    logger.info(f"Message from {sid}: {data}")
    
    # Handle different message types
    if isinstance(data, dict) and data.get('type') == 'user_message':
        # This is a user message from the chat interface
        content = data.get('payload', {}).get('content', '')
        project_id = data.get('payload', {}).get('projectId')
        
        logger.info(f"Processing user message: {content}")
        
        # Send typing indicator
        await sio.emit('typing', True, room=sid)
        
        # Generate AI response
        ai_response = await process_user_message(content, project_id)
        
        # Stop typing indicator  
        await sio.emit('typing', False, room=sid)
        
        # Send response in the format expected by the client
        import datetime
        response_data = {
            'type': 'message',
            'payload': {
                'id': f'ai-{sid}-{int(asyncio.get_event_loop().time() * 1000)}',
                'role': 'assistant',
                'content': ai_response,
                'timestamp': datetime.datetime.now().isoformat(),
                'status': 'sent'
            }
        }
        
        await sio.emit('message', response_data, room=sid)
        logger.info(f"Sent AI response to {sid}: {ai_response[:100]}...")
    else:
        # Handle other message types or malformed messages
        logger.warning(f"Received unexpected message format from {sid}: {data}")
        error_response = {
            'type': 'error',
            'payload': {
                'message': 'Invalid message format. Please use the chat interface.'
            }
        }
        await sio.emit('message', error_response, room=sid)

@sio.event
async def chat(sid, data):
    logger.info(f"Chat message from {sid}: {data}")
    # Process chat message here
    response = {
        'type': 'chat_response', 
        'message': f"You said: {data.get('message', '')}", 
        'timestamp': data.get('timestamp')
    }
    await sio.emit('chat_response', response, room=sid)

# Create ASGI app
socketio_app = socketio.ASGIApp(sio)