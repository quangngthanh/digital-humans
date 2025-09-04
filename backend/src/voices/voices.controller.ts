import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { VoicesService } from './voices.service';
import { 
  TestVoiceDto, 
  VoicesResponseDto, 
  TestVoiceResponseDto 
} from './dto/voice.dto';

@ApiTags('voices')
@Controller('voices')
export class VoicesController {
  private readonly logger = new Logger(VoicesController.name);

  constructor(private readonly voicesService: VoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available voices from ElevenLabs' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of available voices',
    type: VoicesResponseDto 
  })
  @ApiResponse({ status: 500, description: 'Failed to fetch voices' })
  async getVoices(): Promise<VoicesResponseDto> {
    this.logger.debug('Fetching all voices');
    
    return await this.voicesService.getAllVoices();
  }

  @Post('test')
  @ApiOperation({ summary: 'Test a specific voice with custom text' })
  @ApiBody({ type: TestVoiceDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Voice test result with audio',
    type: TestVoiceResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Voice test failed' })
  async testVoice(@Body() testVoiceDto: TestVoiceDto): Promise<TestVoiceResponseDto> {
    const { voiceId, text, model } = testVoiceDto;
    
    this.logger.debug(`Testing voice ${voiceId} with text: "${text.substring(0, 30)}..."`);
    
    return await this.voicesService.testVoice(voiceId, text, model);
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended voices for multilingual content' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of recommended voice IDs',
    schema: {
      type: 'object',
      properties: {
        recommended: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  getRecommendedVoices(): { recommended: string[] } {
    this.logger.debug('Fetching recommended voices');
    
    return {
      recommended: this.voicesService.getRecommendedVoices()
    };
  }
}
