import { Controller, Post, Body, Logger, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Get default greeting messages' })
  @ApiResponse({ status: 200, description: 'Default greeting messages', type: ChatResponseDto })
  async getGreeting(): Promise<ChatResponseDto> {
    this.logger.debug('Received greeting request');
    
    const messages = await this.chatService.processMessage();
    
    return { messages };
  }

  @Post()
  @ApiOperation({ summary: 'Send a message to the virtual girlfriend' })
  @ApiBody({ type: ChatMessageDto })
  @ApiResponse({ status: 200, description: 'Response from virtual girlfriend', type: ChatResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendMessage(@Body() chatMessageDto: ChatMessageDto): Promise<ChatResponseDto> {
    const { message } = chatMessageDto;
    
    this.logger.debug(`Received chat message: ${message?.substring(0, 50)}...`);
    
    const messages = await this.chatService.processMessage(message);
    
    return { messages };
  }
}
