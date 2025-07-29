#!/usr/bin/env python3
"""
WebSocket connection test script
"""
import socketio
import asyncio
import logging
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_websocket_connection():
    """Test WebSocket connection to the backend"""
    
    # Create client
    sio = socketio.AsyncClient(logger=True, engineio_logger=True)
    
    @sio.event
    async def connect():
        logger.info("Connected to server")
        
        # Test sending a message
        test_message = {
            'type': 'user_message',
            'payload': {
                'content': 'Hello from test client',
                'projectId': 'test-project'
            }
        }
        
        logger.info(f"Sending test message: {test_message}")
        await sio.emit('message', test_message)
    
    @sio.event
    async def disconnect():
        logger.info("Disconnected from server")
    
    @sio.event
    async def message(data):
        logger.info(f"Received message: {data}")
    
    @sio.event
    async def welcome(data):
        logger.info(f"Received welcome: {data}")
    
    @sio.event
    async def typing(data):
        logger.info(f"Received typing indicator: {data}")
    
    @sio.event
    async def connect_error(data):
        logger.error(f"Connection error: {data}")
    
    try:
        # Connect to the server
        logger.info("Attempting to connect to http://localhost:8087")
        await sio.connect('http://localhost:8087')
        
        # Wait for a few seconds to receive responses
        await asyncio.sleep(5)
        
        # Disconnect
        await sio.disconnect()
        
    except Exception as e:
        logger.error(f"Error during connection test: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket_connection())