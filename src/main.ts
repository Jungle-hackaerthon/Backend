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
    .setTitle('API Docs')
    .setDescription('My API documentation')
    .setVersion('1.0')
    .addBearerAuth()
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
