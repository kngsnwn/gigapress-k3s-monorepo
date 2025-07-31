#!/usr/bin/env python3
"""
Start the full GigaPress AI Engine service with all API endpoints
"""
import uvicorn
import asyncio
import logging
from app.main import socket_app
from config.settings import settings
from app.services.ai_service import ai_service

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def startup():
    """Initialize AI service before starting server"""
    logger.info("Initializing AI service...")
    await ai_service.initialize()
    logger.info("AI service initialization complete")

def main():
    """Main entry point"""
    # Run startup tasks
    asyncio.run(startup())
    
    # Start the server
    logger.info(f"Starting GigaPress AI Engine on {settings.app_host}:{settings.app_port}")
    uvicorn.run(
        socket_app,
        host=settings.app_host,
        port=settings.app_port,
        log_level=settings.log_level.lower(),
        reload=False  # Disable reload to avoid startup issues
    )

if __name__ == "__main__":
    main()