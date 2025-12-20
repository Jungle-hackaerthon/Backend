import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://hackerton:hackerton123@localhost:5432/hackerton',
  jwtSecret: process.env.JWT_SECRET || 'ffffff',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN as string) || '1h',
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: envConfig.databaseUrl,
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: true, // TODO: 프로덕션에서는 false로 변경 필요
  logging: false,
};
