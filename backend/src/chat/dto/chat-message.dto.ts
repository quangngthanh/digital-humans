import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({
    description: 'The message from the user to the virtual girlfriend',
    example: 'Hello beautiful, how are you today?',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @ApiPropertyOptional({
    description: 'Language for the conversation',
    example: 'vietnamese',
    default: 'vietnamese'
  })
  @IsString()
  @IsOptional()
  language?: string = 'vietnamese';
}
