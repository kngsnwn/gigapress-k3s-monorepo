import socketio
import asyncio
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

async def test_connection():
    sio = socketio.AsyncClient()
    
    @sio.event
    async def connect():
        print("✅ Connected to SocketIO server!")
        print(f"Session ID: {sio.sid}")
    
    @sio.event
    async def disconnect():
        print("❌ Disconnected from server")
    
    @sio.event
    async def connect_error(data):
        print(f"❌ Connection error: {data}")
    
    try:
        print("🔄 Attempting to connect to http://localhost:8087...")
        await sio.connect('http://localhost:8087', wait_timeout=10, transports=['websocket', 'polling'])
        print("✅ Connection successful!")
        
        # Wait a bit then disconnect
        await asyncio.sleep(2)
        await sio.disconnect()
        
    except Exception as e:
        print(f"❌ Failed to connect: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())