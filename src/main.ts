import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

  await app.listen(envConfig.port);
  console.log(`Application is running on: http://localhost:${envConfig.port}`);
}
bootstrap();
