import { IsArray, IsString, IsIn, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EmotionalIntentDto } from './emotional-intent.dto';

export class MessageDto {
  @ApiProperty({
    description: 'The text content of the message',
    example: 'Hi sweetie! I missed you so much!',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Emotional intent instead of specific facial expression',
    type: EmotionalIntentDto,
  })
  @ValidateNested()
  @Type(() => EmotionalIntentDto)
  emotionalIntent: EmotionalIntentDto;

  @ApiProperty({
    description: 'Message metadata for frontend processing',
    example: {
      messageLength: 25,
      estimatedDuration: 3000,
      conversationTurn: 1
    },
    required: false,
  })
  @IsOptional()
  metadata?: {
    messageLength: number;
    estimatedDuration: number;
    conversationTurn: number;
  };

  @ApiProperty({
    description: 'Base64 encoded audio data',
    required: false,
  })
  @IsString()
  @IsOptional()
  audio?: string;

  @ApiProperty({
    description: 'Lipsync data for the audio',
    required: false,
  })
  @IsOptional()
  lipsync?: any;
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'Array of response messages from the virtual girlfriend',
    type: [MessageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}
