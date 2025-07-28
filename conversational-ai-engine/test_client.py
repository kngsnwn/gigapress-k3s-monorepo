#!/usr/bin/env python3
"""
Simple Socket.IO client to test AI engine functionality
"""

import socketio
import asyncio
import json
import time

# Create a Socket.IO client
sio = socketio.AsyncClient()

@sio.event
async def connect():
    print("[OK] Connected to AI engine")
    
    # Test message
    test_message = {
        'type': 'user_message',
        'payload': {
            'content': '상품 카탈로그와 리뷰가 있는 쇼핑몰 만들어줘',
            'projectId': 'test-project'
        }
    }
    
    print(f"[SEND] Test message: {test_message['payload']['content']}")
    await sio.emit('message', test_message)

@sio.event
async def disconnect():
    print("[DISC] Disconnected from AI engine")

@sio.event
async def message(data):
    print(f"[RECV] Received message: {data}")
    if data.get('type') == 'message' and data.get('payload', {}).get('role') == 'assistant':
        content = data['payload']['content']
        print(f"[AI] Response: {content[:100]}...")
        # Disconnect after receiving response
        await sio.disconnect()

@sio.event
async def typing(is_typing):
    if is_typing:
        print("[TYPE] AI is typing...")
    else:
        print("[STOP] AI stopped typing")

async def test_ai_engine():
    try:
        print("[TEST] Testing AI Engine...")
        await sio.connect('http://localhost:8087')
        await sio.wait()
        print("[PASS] Test completed successfully!")
    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
    finally:
        await sio.disconnect()

if __name__ == "__main__":
    asyncio.run(test_ai_engine())