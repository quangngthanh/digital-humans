import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TestVoiceDto {
  @ApiProperty({
    description: 'ElevenLabs voice ID to test',
    example: 'RmcV9cAq1TByxNSgbii7',
  })
  @IsString()
  @IsNotEmpty()
  voiceId: string;

  @ApiProperty({
    description: 'Text to synthesize for testing',
    example: 'Xin chào! Tôi là trợ lý ảo của bạn.',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'TTS model to use',
    example: 'eleven_flash_v2_5',
    required: false,
  })
  @IsString()
  @IsOptional()
  model?: string;
}

export class VoiceInfoDto {
  @ApiProperty({ description: 'Voice ID' })
  voice_id: string;

  @ApiProperty({ description: 'Voice name' })
  name: string;

  @ApiProperty({ description: 'Voice category' })
  category: string;

  @ApiProperty({ description: 'Voice labels and metadata' })
  labels: Record<string, any>;

  @ApiProperty({ description: 'Preview URL', required: false })
  preview_url?: string;

  @ApiProperty({ description: 'Available tiers', required: false })
  available_for_tiers?: string[];
}

export class VoicesResponseDto {
  @ApiProperty({ description: 'Request success status' })
  success: boolean;

  @ApiProperty({ description: 'Total number of voices' })
  total: number;

  @ApiProperty({ description: 'List of available voices', type: [VoiceInfoDto] })
  voices: VoiceInfoDto[];
}

export class TestVoiceResponseDto {
  @ApiProperty({ description: 'Test success status' })
  success: boolean;

  @ApiProperty({ description: 'Success message', required: false })
  message?: string;

  @ApiProperty({ description: 'Voice ID that was tested' })
  voiceId: string;

  @ApiProperty({ description: 'Model used for synthesis' })
  model: string;

  @ApiProperty({ description: 'Text that was synthesized' })
  text: string;

  @ApiProperty({ description: 'Base64 encoded audio', required: false })
  audio?: string;

  @ApiProperty({ description: 'Error message if failed', required: false })
  error?: string;
}
