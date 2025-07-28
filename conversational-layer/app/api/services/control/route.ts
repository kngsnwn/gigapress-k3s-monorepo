import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const serviceScripts: Record<string, { start: string; stop: string }> = {
  'conversational-ai-engine': {
    start: 'cd ../conversational-ai-engine && python main.py',
    stop: 'pkill -f "python main.py"'
  },
  'mcp-server': {
    start: 'cd ../mcp-server && ./gradlew bootRun',
    stop: 'pkill -f "mcp-server"'
  },
  'domain-schema-service': {
    start: 'cd ../domain-schema-service && ./gradlew bootRun',
    stop: 'pkill -f "domain-schema-service"'
  },
  'backend-service': {
    start: 'cd ../backend-service && ./gradlew bootRun',
    stop: 'pkill -f "backend-service"'
  },
  'design-frontend-service': {
    start: 'cd ../design-frontend-service && npm start',
    stop: 'pkill -f "design-frontend-service"'
  },
  'infra-version-control-service': {
    start: 'cd ../infra-version-control-service && python main.py',
    stop: 'pkill -f "infra-version-control-service"'
  },
  'dynamic-update-engine': {
    start: 'cd ../dynamic-update-engine && ./gradlew bootRun',
    stop: 'pkill -f "dynamic-update-engine"'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { serviceId, action } = await request.json();

    if (!serviceScripts[serviceId]) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    if (action !== 'start' && action !== 'stop') {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }

    const script = serviceScripts[serviceId][action as 'start' | 'stop'];
    
    // Windows 환경에서는 다른 명령어 사용
    const isWindows = process.platform === 'win32';
    const command = isWindows ? script.replace('pkill', 'taskkill /F /IM') : script;

    try {
      if (action === 'start') {
        // 백그라운드에서 서비스 시작
        if (isWindows) {
          exec(`start /B ${command}`);
        } else {
          exec(`${command} &`);
        }
      } else {
        await execAsync(command);
      }

      // 상태 확인을 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 2000));

      return NextResponse.json({
        status: action === 'start' ? 'running' : 'stopped',
        message: `Service ${serviceId} ${action}ed successfully`
      });
    } catch (error) {
      console.error(`Failed to ${action} service ${serviceId}:`, error);
      return NextResponse.json(
        { error: `Failed to ${action} service`, status: 'error' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}