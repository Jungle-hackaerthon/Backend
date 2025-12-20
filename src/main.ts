import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { envConfig } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: '*', // TODO: 프로덕션에서는 특정 도메인으로 제한
    credentials: true,
  });

  // Validation 파이프 적용
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Socket.IO Adapter 설정
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(envConfig.port);
  console.log(`Application is running on: http://localhost:${envConfig.port}`);
  console.log(`Socket.IO enabled with default adapter`);
}

bootstrap();
