"""
Unified AI Service for handling different AI providers
"""
from typing import Dict, Any, List, Optional, AsyncGenerator
from datetime import datetime
import json
import logging
import asyncio
from abc import ABC, abstractmethod

from config.settings import settings

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    """Abstract base class for AI providers"""
    
    @abstractmethod
    async def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        stream: bool = False
    ) -> AsyncGenerator[str, None] | str:
        """Generate AI response"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider is available"""
        pass


class OpenAIProvider(AIProvider):
    """OpenAI API provider"""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.client = None
        
    async def initialize(self):
        """Initialize OpenAI client"""
        if not self.api_key:
            logger.warning("OpenAI API key not provided")
            return
            
        try:
            import openai
            self.client = openai.AsyncOpenAI(api_key=self.api_key)
            logger.info("OpenAI client initialized")
        except ImportError:
            logger.error("OpenAI package not installed. Run: pip install openai")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
    
    def is_available(self) -> bool:
        """Check if OpenAI provider is available"""
        return bool(self.api_key and self.client)
    
    async def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        stream: bool = False
    ) -> AsyncGenerator[str, None] | str:
        """Generate response using OpenAI API"""
        if not self.is_available():
            raise RuntimeError("OpenAI provider not available")
        
        try:
            # Convert messages to OpenAI format
            openai_messages = []
            for msg in messages:
                openai_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            if stream:
                return self._stream_response(openai_messages)
            else:
                return await self._generate_response(openai_messages)
                
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    async def _generate_response(self, messages: List[Dict[str, str]]) -> str:
        """Generate non-streaming response"""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens
        )
        return response.choices[0].message.content
    
    async def _stream_response(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """Generate streaming response"""
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


class AnthropicProvider(AIProvider):
    """Anthropic Claude API provider"""
    
    def __init__(self):
        self.api_key = settings.anthropic_api_key
        self.model = settings.claude_model
        self.client = None
        
    async def initialize(self):
        """Initialize Anthropic client"""
        if not self.api_key:
            logger.warning("Anthropic API key not provided")
            return
            
        try:
            import anthropic
            self.client = anthropic.AsyncAnthropic(api_key=self.api_key)
            logger.info("Anthropic client initialized")
        except ImportError:
            logger.error("Anthropic package not installed. Run: pip install anthropic")
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic client: {e}")
    
    def is_available(self) -> bool:
        """Check if Anthropic provider is available"""
        return bool(self.api_key and self.client)
    
    async def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        stream: bool = False
    ) -> AsyncGenerator[str, None] | str:
        """Generate response using Anthropic API"""
        if not self.is_available():
            raise RuntimeError("Anthropic provider not available")
        
        try:
            # Convert messages to Anthropic format
            anthropic_messages = []
            system_message = ""
            
            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                else:
                    anthropic_messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
            
            if stream:
                return self._stream_response(anthropic_messages, system_message)
            else:
                return await self._generate_response(anthropic_messages, system_message)
                
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise
    
    async def _generate_response(
        self, 
        messages: List[Dict[str, str]], 
        system: str = ""
    ) -> str:
        """Generate non-streaming response"""
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=settings.max_tokens,
            temperature=settings.temperature,
            system=system,
            messages=messages
        )
        return response.content[0].text
    
    async def _stream_response(
        self, 
        messages: List[Dict[str, str]], 
        system: str = ""
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response"""
        async with self.client.messages.stream(
            model=self.model,
            max_tokens=settings.max_tokens,
            temperature=settings.temperature,
            system=system,
            messages=messages
        ) as stream:
            async for text in stream.text_stream:
                yield text


class LocalProvider(AIProvider):
    """Local fallback provider for testing"""
    
    def is_available(self) -> bool:
        return True
    
    async def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        stream: bool = False
    ) -> AsyncGenerator[str, None] | str:
        """Generate mock response"""
        if not messages:
            response = "안녕하세요! GigaPress AI 어시스턴트입니다. 어떤 프로젝트를 만들어드릴까요?"
        else:
            last_message = messages[-1]["content"]
            response = self._generate_mock_response(last_message)
        
        if stream:
            return self._stream_mock_response(response)
        else:
            return response
    
    def _generate_mock_response(self, user_message: str) -> str:
        """Generate context-aware mock response"""
        user_input = user_message.lower()
        
        if any(keyword in user_input for keyword in ['쇼핑몰', '이커머스', '온라인쇼핑']):
            return """네, 쇼핑몰 프로젝트를 생성해드리겠습니다! 🛍️

**주요 기능:**
• 📦 상품 관리 시스템
• 🛒 장바구니 및 주문 처리
• 💳 결제 시스템 연동
• ⭐ 리뷰 및 평점 시스템
• 👤 회원 관리

**기술 스택:**
• Frontend: React + TypeScript
• Backend: Spring Boot + JPA
• Database: PostgreSQL
• Payment: 아임포트 연동

실제 AI API를 연결하시면 더 상세한 분석과 코드 생성이 가능합니다.
프로젝트 생성을 시작할까요?"""

        elif any(keyword in user_input for keyword in ['예약', '회의실', '예약관리']):
            return """회의실 예약 관리 서비스를 만들어드리겠습니다! 📅

**핵심 기능:**
• 🏢 회의실 현황 및 실시간 예약 확인
• 📅 캘린더 기반 예약 시스템
• 👥 사용자 권한 관리
• 📧 예약 확인 알림
• 📊 사용률 통계

**기술 스택:**
• Frontend: React + TypeScript
• Backend: Spring Boot + WebSocket
• Database: PostgreSQL
• Real-time: Socket.io

실제 AI API 키를 설정하시면 더 정확한 분석을 제공할 수 있습니다.
어떤 규모의 조직을 대상으로 하시나요?"""

        else:
            return f""""{user_message}"에 대한 프로젝트를 분석해보겠습니다!

**분석 결과:**
• 요구사항 분석 완료
• 적합한 기술 스택 검토 중
• 아키텍처 설계 진행

**제안 기술 스택:**
• Frontend: React + TypeScript
• Backend: Spring Boot + JPA
• Database: PostgreSQL
• Deployment: Docker + Kubernetes

⚠️ 현재 로컬 모드로 실행 중입니다.
실제 AI API (OpenAI 또는 Anthropic)를 연결하시면 더 정확하고 상세한 분석을 제공할 수 있습니다.

구체적인 기능 요구사항을 더 알려주시면 맞춤형 설계를 도와드리겠습니다!"""
    
    async def _stream_mock_response(self, response: str) -> AsyncGenerator[str, None]:
        """Stream mock response with typing simulation"""
        words = response.split()
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0.05)  # Simulate typing speed


class AIService:
    """Unified AI service that manages different providers"""
    
    def __init__(self):
        self.providers = {
            "openai": OpenAIProvider(),
            "anthropic": AnthropicProvider(),
            "local": LocalProvider()
        }
        self.current_provider = None
        
    async def initialize(self):
        """Initialize AI service and providers"""
        logger.info("Initializing AI service...")
        
        # Initialize all providers
        for provider_name, provider in self.providers.items():
            if provider_name != "local":
                await provider.initialize()
        
        # Select the best available provider
        await self._select_provider()
        
        logger.info(f"AI service initialized with provider: {self.current_provider}")
    
    async def _select_provider(self):
        """Select the best available provider"""
        # Try configured provider first
        preferred_provider = settings.ai_provider
        if preferred_provider in self.providers and self.providers[preferred_provider].is_available():
            self.current_provider = preferred_provider
            return
        
        # Try OpenAI
        if self.providers["openai"].is_available():
            self.current_provider = "openai"
            return
        
        # Try Anthropic
        if self.providers["anthropic"].is_available():
            self.current_provider = "anthropic"
            return
        
        # Fallback to local
        self.current_provider = "local"
        logger.warning("No AI API keys available, using local fallback provider")
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for GigaPress AI Assistant"""
        return """당신은 GigaPress AI 개발 어시스턴트입니다.

주요 역할:
- 사용자의 요구사항을 분석하여 웹 애플리케이션 및 서비스 개발을 도와줍니다
- 적절한 기술 스택을 제안하고 프로젝트 구조를 설계합니다
- Spring Boot, React, PostgreSQL 등 모던 기술 스택을 활용한 솔루션을 제안합니다
- 실용적이고 구현 가능한 아키텍처를 설계합니다
- 데이터베이스 설계, API 설계, 보안 고려사항을 포함합니다

응답 가이드라인:
- 친근하고 전문적인 톤으로 답변합니다
- 구체적인 기술 스택과 구현 방법을 제시합니다
- 사용자의 요구사항에 맞는 맞춤형 솔루션을 제공합니다
- 마크다운 형식을 사용하여 가독성을 높입니다
- 이모지를 적절히 사용하여 친근함을 표현합니다
- 추가 질문이나 clarification이 필요한 경우 적극적으로 물어봅니다
- 보안, 확장성, 유지보수성을 고려한 설계를 제안합니다"""
    
    async def generate_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        stream: bool = False
    ) -> AsyncGenerator[str, None] | str:
        """Generate AI response"""
        if not self.current_provider:
            await self._select_provider()
        
        # Prepare messages
        messages = []
        
        # Add system prompt
        messages.append({
            "role": "system",
            "content": self.get_system_prompt()
        })
        
        # Add conversation history (last 10 messages to manage token usage)
        if conversation_history:
            recent_history = conversation_history[-10:]
            messages.extend(recent_history)
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        try:
            provider = self.providers[self.current_provider]
            return await provider.generate_response(messages, stream)
        except Exception as e:
            logger.error(f"Error generating response with {self.current_provider}: {e}")
            
            # Fallback to local provider
            if self.current_provider != "local":
                logger.info("Falling back to local provider")
                self.current_provider = "local"
                provider = self.providers["local"]
                return await provider.generate_response(messages, stream)
            else:
                raise
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Get information about current provider"""
        return {
            "current_provider": self.current_provider,
            "available_providers": [
                name for name, provider in self.providers.items() 
                if provider.is_available()
            ],
            "provider_status": {
                name: provider.is_available() 
                for name, provider in self.providers.items()
            }
        }


# Create singleton instance
ai_service = AIService()