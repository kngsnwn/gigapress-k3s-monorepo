#!/usr/bin/env python3
"""
Simple Socket.IO server test
"""
import socketio
import uvicorn
from fastapi import FastAPI

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode="asgi"
)

# Create FastAPI app
app = FastAPI()

@app.get("/")
async def root():
    return {"message": "FastAPI + Socket.IO"}

@app.get("/health")
async def health():
    return {"status": "ok"}

# Socket.IO events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.emit('welcome', {'message': 'Connected!'}, room=sid)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def message(sid, data):
    print(f"Message from {sid}: {data}")
    await sio.emit('response', {'echo': data}, room=sid)

# Combine FastAPI and Socket.IO
combined_app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    uvicorn.run(combined_app, host="0.0.0.0", port=8087)