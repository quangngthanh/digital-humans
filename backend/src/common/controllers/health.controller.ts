import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    const hasGeminiKey = !!this.configService.get('app.ai.geminiApiKey');
    const hasElevenLabsKey = !!this.configService.get('app.tts.elevenLabsApiKey');

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('app.environment'),
      version: '1.0.0',
      services: {
        gemini: hasGeminiKey ? 'configured' : 'missing_api_key',
        elevenLabs: hasElevenLabsKey ? 'configured' : 'missing_api_key',
      },
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready to serve requests' })
  getReadiness() {
    const hasGeminiKey = !!this.configService.get('app.ai.geminiApiKey');
    const hasElevenLabsKey = !!this.configService.get('app.tts.elevenLabsApiKey');

    const isReady = hasGeminiKey && hasElevenLabsKey;

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        gemini_api_key: hasGeminiKey,
        elevenlabs_api_key: hasElevenLabsKey,
      },
    };
  }
}
