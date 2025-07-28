#!/usr/bin/env python3
"""
Test full flow: User question -> AI Engine -> Response display
"""

import socketio
import asyncio
import json

print("[INFO] Testing full Q&A flow...")

sio = socketio.AsyncClient()

test_questions = [
    "상품 카탈로그와 리뷰가 있는 쇼핑몰 만들어줘",
    "Create a simple blog website",
    "How to implement user authentication?"
]

current_test = 0

@sio.event
async def connect():
    print(f"[CONN] Connected to AI engine (port 8087)")
    await send_next_question()

@sio.event
async def message(data):
    if data.get('type') == 'message' and data.get('payload', {}).get('role') == 'assistant':
        content = data['payload']['content']
        print(f"[RECV] AI Response length: {len(content)} characters")
        print(f"[RECV] Preview: {content[:50]}...")
        
        global current_test
        current_test += 1
        
        if current_test < len(test_questions):
            print(f"[NEXT] Testing question {current_test + 1}")
            await asyncio.sleep(1)
            await send_next_question()
        else:
            print("[DONE] All tests completed!")
            await sio.disconnect()

@sio.event
async def typing(is_typing):
    print(f"[TYPE] {'Processing...' if is_typing else 'Response ready'}")

async def send_next_question():
    question = test_questions[current_test]
    print(f"[SEND] Question {current_test + 1}: {question}")
    
    message = {
        'type': 'user_message',
        'payload': {
            'content': question,
            'projectId': f'test-{current_test}'
        }
    }
    await sio.emit('message', message)

async def test_flow():
    try:
        await sio.connect('http://localhost:8087')
        await sio.wait()
        print("[PASS] Full flow test completed successfully!")
    except Exception as e:
        print(f"[FAIL] Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_flow())