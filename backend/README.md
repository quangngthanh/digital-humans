# Avatar3D NestJS Backend

A professional NestJS backend for the Avatar3D virtual girlfriend application with TypeScript, AI conversation, text-to-speech, and lip sync capabilities.

## 🚀 Features

- **AI Conversation**: Google Gemini 2.0 Flash integration for natural conversations
- **Text-to-Speech**: ElevenLabs API with Vietnamese support
- **Lip Sync**: Rhubarb-based automatic lip sync generation
- **Voice Management**: Voice testing and management endpoints
- **Type Safety**: Full TypeScript implementation
- **API Documentation**: Auto-generated Swagger documentation
- **Error Handling**: Centralized exception handling
- **Logging**: Structured logging with Winston
- **Validation**: Request/response validation with class-validator
- **Rate Limiting**: Built-in rate limiting protection
- **Health Checks**: Health and readiness endpoints

## 🏗️ Architecture

```
src/
├── ai/                   # Google Gemini integration
├── chat/                 # Chat orchestration and endpoints
├── tts/                  # ElevenLabs text-to-speech
├── lipsync/             # Rhubarb lip sync processing
├── voices/              # Voice management
├── common/              # Shared utilities and filters
├── config/              # Configuration and validation
├── main.ts              # Application bootstrap
└── app.module.ts        # Root module
```

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- NPM or Yarn
- FFmpeg (for audio conversion)
- Rhubarb (included in `bin/` directory)

### Setup

1. **Install dependencies**:
```bash
npm install
# or
yarn install
```

2. **Configure environment**:
```bash
cp .env.example .env
```

3. **Add your API keys** to `.env`:
```bash
# Get your Gemini API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Get your ElevenLabs API key from: https://elevenlabs.io/app/settings/api-keys
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key_here
```

## 🚀 Running the Application

### Development
```bash
npm run start:dev
# or
yarn start:dev
```

### Production
```bash
npm run build
npm run start:prod
# or
yarn build
yarn start:prod
```

The API will be available at:
- **Main API**: `http://localhost:3007/api/v1`
- **API Documentation**: `http://localhost:3007/api/docs`
- **Health Check**: `http://localhost:3007/api/v1/health`

## 📚 API Endpoints

### Chat Endpoints
- `GET /api/v1/chat` - Get default greeting messages
- `POST /api/v1/chat` - Send message to virtual girlfriend

### Voice Endpoints
- `GET /api/v1/voices` - Get all available voices
- `POST /api/v1/voices/test` - Test a specific voice
- `GET /api/v1/voices/recommended` - Get recommended voices

### Health Endpoints
- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness check

## 🔧 Configuration

The application supports environment-based configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3007` |
| `GEMINI_API_KEY` | Google Gemini API key | **Required** |
| `ELEVEN_LABS_API_KEY` | ElevenLabs API key | **Required** |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.0-flash-exp` |
| `DEFAULT_VOICE_ID` | Default ElevenLabs voice | `RmcV9cAq1TByxNSgbii7` |
| `TTS_MODEL` | TTS model for Vietnamese | `eleven_flash_v2_5` |
| `AUDIOS_DIR` | Audio files directory | `./audios` |
| `RHUBARB_PATH` | Path to Rhubarb executable | `./bin/rhubarb.exe` |
| `FFMPEG_PATH` | Path to FFmpeg | `ffmpeg` |

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📝 API Usage Examples

### Send a Chat Message
```bash
curl -X POST http://localhost:3007/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello beautiful, how are you today?"}'
```

### Test a Voice
```bash
curl -X POST http://localhost:3007/api/v1/voices/test \
  -H "Content-Type: application/json" \
  -d '{
    "voiceId": "RmcV9cAq1TByxNSgbii7",
    "text": "Xin chào! Tôi là trợ lý ảo của bạn.",
    "model": "eleven_flash_v2_5"
  }'
```

### Get All Voices
```bash
curl http://localhost:3007/api/v1/voices
```

## 🔍 Monitoring

### Health Checks
```bash
# Basic health check
curl http://localhost:3007/api/v1/health

# Readiness check (validates API keys)
curl http://localhost:3007/api/v1/health/ready
```

### Logging
The application uses structured logging with different levels:
- **Debug**: Detailed execution information
- **Info**: General application events
- **Warn**: Warning conditions
- **Error**: Error conditions with stack traces

Logs are written to:
- Console (colored, development-friendly)
- `logs/error.log` (error level only)
- `logs/combined.log` (all levels)

## 🛠️ Development

### Project Structure
- **Modular Architecture**: Each feature is encapsulated in its own module
- **Dependency Injection**: Clean, testable code with NestJS DI container
- **Type Safety**: Full TypeScript coverage with strict settings
- **Validation**: Request/response validation with decorators
- **Documentation**: Auto-generated API docs with Swagger

### Adding New Features
1. Create a new module: `nest g module feature-name`
2. Add service: `nest g service feature-name`
3. Add controller: `nest g controller feature-name`
4. Create DTOs with validation decorators
5. Add to main `app.module.ts`

## 🚨 Troubleshooting

### Common Issues

1. **Missing API Keys**: Check `.env` file and ensure both Gemini and ElevenLabs keys are set
2. **FFmpeg Not Found**: Ensure FFmpeg is installed and in PATH, or set `FFMPEG_PATH`
3. **Rhubarb Permissions**: On Windows, ensure `bin/rhubarb.exe` has execute permissions
4. **Audio Directory**: Ensure `audios/` directory exists and is writable
5. **Port Already in Use**: Change `PORT` in `.env` or kill existing process

### Vietnamese TTS Issues
- Use `eleven_flash_v2_5` model for best Vietnamese support
- Recommended voices: See `/api/v1/voices/recommended` endpoint
- Test voices before production use with `/api/v1/voices/test`

### Performance Tips
- Enable audio file caching in production
- Use rate limiting to prevent API abuse
- Monitor ElevenLabs API usage and quotas
- Consider audio compression for faster loading

## 🔐 Security Considerations

- **API Keys**: Never commit `.env` file to version control
- **Rate Limiting**: Enabled by default (100 requests/15 minutes per IP)
- **CORS**: Configure `CORS_ORIGIN` for production
- **Helmet**: Security headers enabled
- **Validation**: All inputs validated and sanitized

## 📈 Performance & Scaling

- **Caching**: Implement Redis for audio file caching
- **Load Balancing**: Use reverse proxy (nginx) for multiple instances
- **Database**: Add database for conversation history and user management
- **CDN**: Serve audio files through CDN for global distribution
- **Monitoring**: Add APM tools (New Relic, DataDog) for production monitoring

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: Available at `/api/docs` when running
- **API Reference**: Swagger UI with live testing capabilities

## 🚀 Migration from Express Version

This NestJS version provides the same functionality as the original Express app with these improvements:

- **Better Architecture**: Modular, scalable structure
- **Type Safety**: Full TypeScript implementation
- **Better Error Handling**: Centralized exception filtering
- **API Documentation**: Auto-generated Swagger docs
- **Testing Support**: Built-in testing framework
- **Configuration Management**: Environment-based config with validation
- **Logging**: Structured logging with multiple transports
- **Security**: Built-in security features and validation

All existing API endpoints are preserved with the same functionality but improved reliability and maintainability.
