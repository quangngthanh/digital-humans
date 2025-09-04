import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number().default(3007),
  
  // Required API Keys
  GEMINI_API_KEY: Joi.string().required().messages({
    'any.required': 'GEMINI_API_KEY is required. Get it from: https://aistudio.google.com/app/apikey'
  }),
  
  ELEVEN_LABS_API_KEY: Joi.string().required().messages({
    'any.required': 'ELEVEN_LABS_API_KEY is required. Get it from: https://elevenlabs.io/app/settings/api-keys'
  }),

  // Optional configurations
  GEMINI_MODEL: Joi.string().default('gemini-2.0-flash-exp'),
  AI_MAX_TOKENS: Joi.number().default(1024),
  AI_TEMPERATURE: Joi.number().min(0).max(1).default(0.7),
  
  DEFAULT_VOICE_ID: Joi.string().default('RmcV9cAq1TByxNSgbii7'),
  TTS_MODEL: Joi.string().default('eleven_flash_v2_5'),
  TTS_STABILITY: Joi.number().min(0).max(1).default(0.5),
  TTS_SIMILARITY_BOOST: Joi.number().min(0).max(1).default(0.8),
  TTS_STYLE: Joi.number().min(0).max(1).default(0.2),
  TTS_SPEAKER_BOOST: Joi.boolean().default(true),
  
  // Paths
  AUDIOS_DIR: Joi.string().default('./audios'),
  RHUBARB_PATH: Joi.string().default('./bin/rhubarb.exe'),
  FFMPEG_PATH: Joi.string().default('ffmpeg'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().default(100),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('*'),
});
