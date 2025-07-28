#!/usr/bin/env python3
"""
Standalone Socket.IO server for GigaPress
"""
import socketio
import uvicorn
import asyncio
import logging

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
    response = {
        'echo': data,
        'from': 'server',
        'timestamp': asyncio.get_event_loop().time()
    }
    await sio.emit('response', response, room=sid)

@sio.event
async def chat(sid, data):
    logger.info(f"Chat message from {sid}: {data}")
    response = {
        'type': 'chat_response',
        'message': f"You said: {data.get('message', '')}",
        'timestamp': data.get('timestamp'),
        'from': 'ai-engine'
    }
    await sio.emit('chat_response', response, room=sid)

@sio.event
async def ping(sid, data):
    logger.info(f"Ping from {sid}")
    await sio.emit('pong', {'timestamp': asyncio.get_event_loop().time()}, room=sid)

# Create ASGI app
app = socketio.ASGIApp(sio)

if __name__ == "__main__":
    logger.info("Starting Socket.IO server on port 8087")
    uvicorn.run(app, host="0.0.0.0", port=8087, log_level="info")