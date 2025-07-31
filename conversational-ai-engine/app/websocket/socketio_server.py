import socketio
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import asyncio
import json

from config.settings import settings

logger = logging.getLogger(__name__)

# Create Socket.IO server instance
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',  # Allow all origins in development
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25,
    max_http_buffer_size=1e6,
    compression_threshold=1024
)


class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, Any]] = {}
        
    async def connect(self, sid: str, environ: dict):
        """Handle new connection"""
        self.active_connections[sid] = {
            'connected_at': datetime.utcnow(),
            'last_activity': datetime.utcnow(),
            'environ': environ
        }
        logger.info(f"Client connected: {sid}")
        logger.info(f"Total connections: {len(self.active_connections)}")
        
    async def disconnect(self, sid: str):
        """Handle disconnection"""
        if sid in self.active_connections:
            del self.active_connections[sid]
        logger.info(f"Client disconnected: {sid}")
        logger.info(f"Total connections: {len(self.active_connections)}")
        
    def get_connection(self, sid: str) -> Optional[Dict[str, Any]]:
        """Get connection info"""
        return self.active_connections.get(sid)
        
    def update_activity(self, sid: str):
        """Update last activity timestamp"""
        if sid in self.active_connections:
            self.active_connections[sid]['last_activity'] = datetime.utcnow()


# Create connection manager instance
connection_manager = ConnectionManager()


# Socket.IO event handlers
@sio.event
async def connect(sid: str, environ: dict, auth: Optional[dict] = None):
    """Handle client connection"""
    try:
        await connection_manager.connect(sid, environ)
        
        # Send welcome message
        await sio.emit('connected', {
            'message': 'Connected to GigaPress AI Engine',
            'sessionId': sid,
            'timestamp': datetime.utcnow().isoformat()
        }, room=sid)
        
        return True
        
    except Exception as e:
        logger.error(f"Connection error: {str(e)}")
        return False


@sio.event
async def disconnect(sid: str):
    """Handle client disconnection"""
    try:
        await connection_manager.disconnect(sid)
    except Exception as e:
        logger.error(f"Disconnection error: {str(e)}")


@sio.event
async def ping(sid: str, data: Any = None):
    """Handle ping from client"""
    connection_manager.update_activity(sid)
    await sio.emit('pong', {
        'timestamp': datetime.utcnow().isoformat()
    }, room=sid)


@sio.event
async def message(sid: str, data: Dict[str, Any]):
    """Handle message from client"""
    try:
        connection_manager.update_activity(sid)
        
        logger.info(f"Message from {sid}: {data}")
        
        # Extract message type and payload
        msg_type = data.get('type', 'unknown')
        payload = data.get('payload', {})
        
        if msg_type == 'user_message':
            await handle_user_message(sid, payload)
        elif msg_type == 'project_action':
            await handle_project_action(sid, payload)
        else:
            logger.warning(f"Unknown message type: {msg_type}")
            await sio.emit('error', {
                'message': f'Unknown message type: {msg_type}'
            }, room=sid)
            
    except Exception as e:
        logger.error(f"Message handling error: {str(e)}")
        await sio.emit('error', {
            'message': 'Failed to process message',
            'error': str(e)
        }, room=sid)


async def handle_user_message(sid: str, payload: Dict[str, Any]):
    """Handle user chat message"""
    try:
        content = payload.get('content', '')
        project_id = payload.get('projectId')
        
        logger.info(f"Processing user message: {content[:100]}...")
        
        # Send typing indicator
        await sio.emit('typing', {'isTyping': True}, room=sid)
        
        # Simulate AI processing (replace with actual AI logic)
        await asyncio.sleep(1)
        
        # Generate response
        ai_response = await generate_ai_response(content, project_id)
        
        # Stop typing indicator
        await sio.emit('typing', {'isTyping': False}, room=sid)
        
        # Send AI response
        response_data = {
            'type': 'message',
            'payload': {
                'id': f'ai-{int(datetime.utcnow().timestamp() * 1000)}',
                'role': 'assistant',
                'content': ai_response,
                'timestamp': datetime.utcnow().isoformat(),
                'status': 'sent'
            }
        }
        
        await sio.emit('message', response_data, room=sid)
        
    except Exception as e:
        logger.error(f"Error handling user message: {str(e)}")
        await sio.emit('typing', {'isTyping': False}, room=sid)
        raise


async def handle_project_action(sid: str, payload: Dict[str, Any]):
    """Handle project-related actions"""
    try:
        action = payload.get('action')
        data = payload.get('data', {})
        
        logger.info(f"Processing project action: {action}")
        
        if action == 'create':
            await create_project(sid, data)
        elif action == 'update':
            await update_project(sid, data)
        elif action == 'progress':
            await send_project_progress(sid, data)
        else:
            logger.warning(f"Unknown project action: {action}")
            
    except Exception as e:
        logger.error(f"Error handling project action: {str(e)}")
        raise


async def generate_ai_response(content: str, project_id: Optional[str] = None) -> str:
    """Generate AI response based on user input"""
    
    # Detect Korean shopping mall request
    if "쇼핑몰" in content and ("만들어" in content or "개발" in content):
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

    # Default response
    return f"안녕하세요! '{content}' 메시지를 받았습니다. 어떤 도움이 필요하신가요?"


async def create_project(sid: str, data: Dict[str, Any]):
    """Handle project creation"""
    project_name = data.get('name', 'New Project')
    
    # Send progress updates
    progress_steps = [
        (10, "프로젝트 초기화 중..."),
        (30, "백엔드 서비스 생성 중..."),
        (50, "프론트엔드 설정 중..."),
        (70, "데이터베이스 구성 중..."),
        (90, "최종 설정 중..."),
        (100, "프로젝트 생성 완료!")
    ]
    
    for progress, message in progress_steps:
        await sio.emit('project_progress', {
            'projectId': f'project-{sid}',
            'progress': progress,
            'message': message,
            'status': 'completed' if progress == 100 else 'in_progress'
        }, room=sid)
        await asyncio.sleep(0.5)
    
    # Send completion message
    await sio.emit('project_created', {
        'projectId': f'project-{sid}',
        'name': project_name,
        'status': 'success'
    }, room=sid)


async def update_project(sid: str, data: Dict[str, Any]):
    """Handle project updates"""
    # Implement project update logic
    pass


async def send_project_progress(sid: str, data: Dict[str, Any]):
    """Send project progress updates"""
    await sio.emit('project_progress', data, room=sid)


# Create Socket.IO ASGI app
def create_socketio_app():
    """Create and return Socket.IO ASGI app"""
    return socketio.ASGIApp(
        sio,
        other_asgi_app=None,  # Will be set in main.py
        socketio_path='socket.io'
    )