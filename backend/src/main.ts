import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  // Create Winston logger instance
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  });

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const corsOptions = configService.get('app.cors');
  const rateLimitOptions = configService.get('app.rateLimit');

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
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

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // API versioning
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
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
  
  logger.log(`🚀 Digital Avatar NestJS Backend is running on port ${port}`, 'Bootstrap');
  logger.log(`📋 Environment: ${process.env.NODE_ENV}`, 'Bootstrap');
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`, 'Bootstrap');
  logger.log(`🔗 Health Check: http://localhost:${port}/api/v1/health`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
