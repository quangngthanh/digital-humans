import { IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EmotionType {
  HAPPY = 'happy',
  SAD = 'sad', 
  EXCITED = 'excited',
  ROMANTIC = 'romantic',
  PLAYFUL = 'playful',
  SERIOUS = 'serious',
  SURPRISED = 'surprised',
  CONFUSED = 'confused',
  CARING = 'caring',
  MISCHIEVOUS = 'mischievous',
  THOUGHTFUL = 'thoughtful',
  CONFIDENT = 'confident',
  SHY = 'shy',
  FRUSTRATED = 'frustrated',
  CURIOUS = 'curious'
}

export enum ContextType {
  GREETING = 'greeting',
  QUESTION = 'question',
  COMPLIMENT = 'compliment',
  STORY = 'story',
  GOODBYE = 'goodbye',
  FLIRTING = 'flirting',
  COMFORT = 'comfort',
  CASUAL = 'casual'
}

export enum DurationType {
  BRIEF = 'brief',
  SUSTAINED = 'sustained',
  TRANSITIONAL = 'transitional'
}

export class EmotionalIntentDto {
  @ApiProperty({
    description: 'Primary emotion type',
    enum: EmotionType,
    example: EmotionType.HAPPY,
  })
  @IsEnum(EmotionType)
  primary: EmotionType;

  @ApiProperty({
    description: 'Emotion intensity from 0.1 to 1.0',
    minimum: 0.1,
    maximum: 1.0,
    example: 0.7,
  })
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  intensity: number;

  @ApiProperty({
    description: 'Conversation context',
    enum: ContextType,
    example: ContextType.CASUAL,
  })
  @IsEnum(ContextType)
  context: ContextType;

  @ApiProperty({
    description: 'Duration of the emotional expression',
    enum: DurationType,
    example: DurationType.SUSTAINED,
    required: false,
  })
  @IsOptional()
  @IsEnum(DurationType)
  duration?: DurationType;

  @ApiProperty({
    description: 'Secondary emotion for mixed emotional states',
    enum: EmotionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(EmotionType)
  secondaryEmotion?: EmotionType;
}
