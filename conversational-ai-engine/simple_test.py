#!/usr/bin/env python3

import socketio
import asyncio

sio = socketio.AsyncClient()

@sio.event
async def connect():
    print("[OK] Connected to AI engine")
    
    # Simple English test message
    test_message = {
        'type': 'user_message',
        'payload': {
            'content': 'Create a shopping mall with product catalog',
            'projectId': 'test'
        }
    }
    
    print("[SEND] Sending English test message")
    await sio.emit('message', test_message)

@sio.event
async def message(data):
    print("[RECV] Got AI response!")
    if data.get('type') == 'message':
        role = data.get('payload', {}).get('role')
        print(f"[INFO] Message role: {role}")
        if role == 'assistant':
            print("[PASS] AI response received successfully!")
            await sio.disconnect()

@sio.event
async def typing(is_typing):
    print(f"[TYPE] Typing indicator: {is_typing}")

async def test():
    try:
        print("[TEST] Testing AI Engine connection...")
        await sio.connect('http://localhost:8087')
        await sio.wait()
    except Exception as e:
        print(f"[FAIL] {e}")

if __name__ == "__main__":
    asyncio.run(test())