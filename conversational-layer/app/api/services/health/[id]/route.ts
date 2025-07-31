import { NextRequest, NextResponse } from 'next/server';

const serviceEndpoints: Record<string, string> = {
  'conversational-layer': 'http://localhost:8080',
  'conversational-ai-engine': 'http://localhost:8087/health',
  'mcp-server': 'http://localhost:8082/health',
  'backend-service': 'http://localhost:8084/health',
  'design-frontend-service': 'http://localhost:8085/health',
  'infra-version-control-service': 'http://localhost:8086/health',
  'dynamic-update-engine': 'http://localhost:8081/health'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const serviceId = (await params).id;
  const endpoint = serviceEndpoints[serviceId];

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Invalid service ID' },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      method: 'GET'
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      let healthData;
      try {
        healthData = await response.json();
      } catch {
        healthData = { message: 'Service responding' };
      }
      
      return NextResponse.json({
        status: 'running',
        health: healthData,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: `Service responded with status ${response.status}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.log(`Health check failed for ${serviceId}:`, error.message);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({
        status: 'stopped',
        message: 'Service timeout (3s)',
        timestamp: new Date().toISOString()
      });
    }
    
    // Don't fail completely - just mark as stopped
    return NextResponse.json({
      status: 'stopped',
      message: 'Service not reachable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}