import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { envConfig } from './config/env.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: '*', // TODO: 프로덕션에서는 특정 도메인으로 제한
    credentials: true,
  });

  // Global prefix 설정 (REST API용)
  app.setGlobalPrefix('api');

  // Validation 파이프 적용
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('100won-market API Docs')
    .setDescription(
      'REST API documentation for 100won-market. For WebSocket APIs (/map, /chat), please refer to the markdown documents (mapapi.md, chatapi.md).',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag(
      'Map (WebSocket)',
      'WebSocket-based service for map interactions. See mapapi.md for details.',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // Socket.IO Adapter 설정
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(envConfig.port);
  console.log(`Application is running on: http://localhost:${envConfig.port}`);
  console.log(`Socket.IO enabled with default adapter`);
}

bootstrap();
