from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    app_name: str = "conversational-ai-engine"
    app_version: str = "1.0.0"
    app_port: int = 8087
    app_host: str = "0.0.0.0"
    environment: str = "development"
    debug: bool = True
    
    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    redis_db: int = 0
    
    # Kafka
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_consumer_group: str = "conversational-ai-group"
    kafka_topics: List[str] = ["project-updates", "conversation-events"]
    
    # MCP Server
    mcp_server_url: str = "http://localhost:8082"
    mcp_server_timeout: int = 30
    
    # Backend Service
    backend_service_url: str = "http://localhost:8084"
    backend_api_key: str = ""
    backend_timeout_connect: float = 10.0
    backend_timeout_read: float = 30.0
    backend_timeout_write: float = 30.0
    backend_timeout_pool: float = 30.0
    
    # Connection Pooling
    backend_max_keepalive_connections: int = 20
    backend_max_connections: int = 100
    backend_keepalive_expiry: float = 30.0
    
    # Retry Configuration
    backend_max_retries: int = 3
    backend_backoff_factor: float = 1.0
    backend_max_backoff: float = 60.0
    
    # Circuit Breaker
    backend_circuit_breaker_failure_threshold: int = 5
    backend_circuit_breaker_recovery_timeout: int = 30
    
    # Streaming
    backend_streaming_chunk_size: int = 1024
    backend_streaming_timeout: float = 300.0
    
    # AI API Keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    langchain_tracing_v2: bool = True
    langchain_api_key: str = ""
    langchain_project: str = "gigapress-conversational-ai"
    
    # Model Configuration
    ai_provider: str = "openai"  # "openai" or "anthropic"
    claude_model: str = "claude-3-sonnet-20240229"
    openai_model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: int = 4096
    
    # Streaming Configuration
    enable_streaming: bool = True
    streaming_chunk_size: int = 1024
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:8080", "http://localhost:3000"]
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["*"]
    cors_allow_headers: List[str] = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create singleton instance
settings = Settings()
