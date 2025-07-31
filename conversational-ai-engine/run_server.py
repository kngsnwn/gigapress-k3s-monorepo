import uvicorn
from app.main import socket_app
from config.settings import settings

if __name__ == "__main__":
    uvicorn.run(
        socket_app,
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )