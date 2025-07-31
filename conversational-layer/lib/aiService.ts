import OpenAI from 'openai';

// AI Service 설정
const getOpenAIKey = (): string | undefined => {
  // 환경변수 우선 확인
  if (process.env.NEXT_PUBLIC_OPENAI_API_KEY && process.env.NEXT_PUBLIC_OPENAI_API_KEY !== 'your_openai_api_key_here') {
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  }
  
  // 브라우저에서 localStorage 확인
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('temp_openai_key');
    if (stored && stored.trim()) {
      return stored.trim();
    }
  }
  
  return undefined;
};

const getAnthropicKey = (): string | undefined => {
  if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY && process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
    return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
  }
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('temp_anthropic_key');
    if (stored && stored.trim()) {
      return stored.trim();
    }
  }
  
  return undefined;
};

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private openai: OpenAI | null = null;
  private provider: 'openai' | 'anthropic' | 'local' = 'openai';

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    const openaiKey = getOpenAIKey();
    const anthropicKey = getAnthropicKey();

    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true // 클라이언트 사이드에서 사용하기 위해
      });
      this.provider = 'openai';
    } else if (anthropicKey) {
      this.provider = 'anthropic';
    } else {
      this.provider = 'local';
    }
  }

  // API 키 변경 시 재초기화
  reinitialize() {
    this.initializeProvider();
  }

  private getSystemPrompt(): string {
    return `당신은 GigaPress AI 개발 어시스턴트입니다. 
    
주요 역할:
- 사용자의 요구사항을 분석하여 웹 애플리케이션 및 서비스 개발을 도와줍니다
- 적절한 기술 스택을 제안하고 프로젝트 구조를 설계합니다
- 코드 생성, 데이터베이스 설계, API 설계 등을 지원합니다
- 실용적이고 구현 가능한 솔루션을 제안합니다

응답 가이드라인:
- 친근하고 전문적인 톤으로 답변합니다
- 구체적인 기술 스택과 구현 방법을 제시합니다
- 사용자의 요구사항에 맞는 맞춤형 솔루션을 제공합니다
- 이모지를 적절히 사용하여 가독성을 높입니다
- 추가 질문이나 clarification이 필요한 경우 적극적으로 물어봅니다`;
  }

  async generateResponse(
    messages: ChatMessage[],
    onProgress?: (chunk: string) => void
  ): Promise<AIResponse> {
    try {
      switch (this.provider) {
        case 'openai':
          return await this.generateOpenAIResponse(messages, onProgress);
        case 'anthropic':
          return await this.generateAnthropicResponse(messages, onProgress);
        default:
          return await this.generateLocalResponse(messages);
      }
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  private async generateOpenAIResponse(
    messages: ChatMessage[],
    onProgress?: (chunk: string) => void
  ): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.getSystemPrompt() },
      ...messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }))
    ];

    if (onProgress) {
      // 스트리밍 응답
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: chatMessages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onProgress(content);
        }
      }

      return { content: fullResponse };
    } else {
      // 일반 응답
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: chatMessages,
        max_tokens: 2000,
        temperature: 0.7
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens
        } : undefined
      };
    }
  }

  private async generateAnthropicResponse(
    messages: ChatMessage[],
    onProgress?: (chunk: string) => void
  ): Promise<AIResponse> {
    // Anthropic API 구현 (추후 확장)
    // 현재는 OpenAI를 메인으로 사용
    throw new Error('Anthropic API 구현 예정');
  }

  private async generateLocalResponse(messages: ChatMessage[]): Promise<AIResponse> {
    // API 키가 없을 때의 fallback 응답
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || '';

    const responses = [
      `"${userInput}"에 대한 프로젝트를 분석해보겠습니다!

**프로젝트 개요:**
• 요구사항 분석 완료
• 적합한 기술 스택 검토 중
• 아키텍처 설계 진행

**제안 기술 스택:**
• Frontend: React + TypeScript
• Backend: Node.js + Express
• Database: PostgreSQL
• Deployment: Docker + AWS

실제 AI API를 사용하려면 환경변수에 NEXT_PUBLIC_OPENAI_API_KEY를 설정해주세요.
더 구체적인 요구사항을 알려주시면 상세한 설계를 도와드리겠습니다!`,

      `입력해주신 "${userInput}" 내용을 바탕으로 솔루션을 제안합니다.

**추천 아키텍처:**
• 마이크로서비스 기반 설계
• RESTful API 설계
• 반응형 웹 인터페이스
• 확장 가능한 데이터베이스 구조

**개발 단계:**
1. 요구사항 상세 분석
2. 프로토타입 개발
3. 핵심 기능 구현
4. 테스트 및 최적화

AI API 키를 설정하시면 더 정확하고 상세한 분석을 제공할 수 있습니다!`
    ];

    // 랜덤하게 응답 선택
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // 실제 AI 응답을 시뮬레이션하기 위해 약간의 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { content: randomResponse };
  }

  // 사용 가능한 AI 모델 확인
  getAvailableProvider(): string {
    return this.provider;
  }

  // API 키 상태 확인
  isAPIKeyConfigured(): boolean {
    return this.provider !== 'local';
  }
}

export const aiService = new AIService();
export type { AIResponse, ChatMessage };