import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Application settings
  port: parseInt(process.env.PORT, 10) || 3007,
  environment: process.env.NODE_ENV || 'development',
  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  },

  // AI Configuration
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS, 10) || 1024,
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
  },

  // Text-to-Speech Configuration  
  tts: {
    elevenLabsApiKey: process.env.ELEVEN_LABS_API_KEY,
    defaultVoiceId: process.env.DEFAULT_VOICE_ID || 'RmcV9cAq1TByxNSgbii7',
    defaultModel: process.env.TTS_MODEL || 'eleven_flash_v2_5',
    stability: parseFloat(process.env.TTS_STABILITY) || 0.5,
    similarityBoost: parseFloat(process.env.TTS_SIMILARITY_BOOST) || 0.8,
    style: parseFloat(process.env.TTS_STYLE) || 0.2,
    useSpeakerBoost: process.env.TTS_SPEAKER_BOOST === 'true' || true,
  },

  // File paths and external tools
  paths: {
    audiosDir: process.env.AUDIOS_DIR || './audios',
    rhubarbPath: process.env.RHUBARB_PATH || './bin/rhubarb.exe',
    ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // limit each IP
  },
}));
