#!/usr/bin/env python3
"""
Fixed Socket.IO server with proper CORS configuration
"""
import socketio
import uvicorn
import asyncio
import logging
import datetime
from starlette.applications import Starlette
from starlette.middleware.cors import CORSMiddleware

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Socket.IO server with proper CORS configuration
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Create Starlette app
app = Starlette()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@sio.event
async def connect(sid, environ):
    logger.info(f"Socket.IO client connected: {sid}")
    await sio.emit('welcome', {
        'message': 'Connected to GigaPress AI Engine',
        'sid': sid,
        'timestamp': datetime.datetime.now().isoformat()
    }, room=sid)

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
        
        # Generate AI response (placeholder for now)
        ai_response = f"AI Response: I received your message '{content}'. This is a test response from the AI engine."
        
        # Send response in the format expected by the client
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
    else:
        # Legacy message handling
        await sio.emit('response', {'echo': data, 'from': 'server'}, room=sid)

@sio.event
async def ping(sid, data):
    logger.info(f"Ping from {sid}")
    await sio.emit('pong', {'timestamp': asyncio.get_event_loop().time()}, room=sid)

if __name__ == "__main__":
    logger.info("Starting Fixed Socket.IO server on port 8088")
    logger.info("CORS enabled for all origins")
    uvicorn.run(socket_app, host="0.0.0.0", port=8088, log_level="info")