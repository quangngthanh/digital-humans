import { IsArray, IsString, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    description: 'The text content of the message',
    example: 'Hi sweetie! I missed you so much!',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Facial expression for the avatar',
    enum: ['smile', 'sad', 'angry', 'surprised', 'funnyFace', 'default'],
    example: 'smile',
  })
  @IsString()
  @IsIn(['smile', 'sad', 'angry', 'surprised', 'funnyFace', 'default'])
  facialExpression: string;

  @ApiProperty({
    description: 'Animation for the avatar',
    enum: ['Talking_0', 'Talking_1', 'Talking_2', 'Crying', 'Laughing', 'Rumba', 'Idle', 'Terrified', 'Angry'],
    example: 'Talking_1',
  })
  @IsString()
  @IsIn(['Talking_0', 'Talking_1', 'Talking_2', 'Crying', 'Laughing', 'Rumba', 'Idle', 'Terrified', 'Angry'])
  animation: string;

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
