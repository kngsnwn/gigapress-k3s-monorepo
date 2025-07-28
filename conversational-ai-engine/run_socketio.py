#!/usr/bin/env python3
"""
Simple Socket.IO server for testing
"""
import socketio
import uvicorn
import asyncio
import logging
import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode="asgi",
    logger=True,
    engineio_logger=True
)

@sio.event
async def connect(sid, environ):
    logger.info(f"Socket.IO client connected: {sid}")
    await sio.emit('welcome', {
        'message': 'Connected to GigaPress AI Engine',
        'sid': sid
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

# Create ASGI app
app = socketio.ASGIApp(sio)

if __name__ == "__main__":
    logger.info("Starting Socket.IO server on port 8087")
    uvicorn.run(app, host="0.0.0.0", port=8087, log_level="info")