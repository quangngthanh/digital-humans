import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const logLevels: LogLevel[] = isDevelopment 
    ? ['error', 'warn', 'log', 'debug', 'verbose']
    : ['error', 'warn', 'log'];


  const app = await NestFactory.create(AppModule, {
    logger: logLevels
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const corsOptions = configService.get('app.cors');
  const rateLimitOptions = configService.get('app.rateLimit');

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  // CORS configuration
  app.enableCors(corsOptions);

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: rateLimitOptions.windowMs,
      max: rateLimitOptions.max,
      message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.',
      },
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );
  
  app.useGlobalFilters(new AllExceptionsFilter());

  // API versioning
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('Digital Avatar Backend API')
      .setDescription('NestJS backend for Digital Avatar application')
      .setVersion('1.0')
      .addTag('chat', 'Chat and conversation endpoints')
      .addTag('voices', 'Voice management and testing')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Start the server
  await app.listen(port);
  
  // 🔹 SIMPLE: Use console.log for bootstrap messages (no logger dependency)
  console.log(`🚀 Digital Avatar Backend running on port ${port}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Log Levels: ${logLevels.join(', ')}`);
  if (isDevelopment) {
    console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
  }
  console.log(`🔗 Health Check: http://localhost:${port}/api/v1/health`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
