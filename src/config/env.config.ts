import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || '',
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: envConfig.databaseUrl,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // TODO: 프로덕션에서는 false로 변경 필요
  logging: process.env.NODE_ENV !== 'production',
};
