import { Module } from '@nestjs/common';
import { MapGateway } from './map.gateway';
import { MapService } from './map.service';
import { JwtModule } from '@nestjs/jwt';
import { envConfig } from 'src/config/env.config';

@Module({
  imports: [
    JwtModule.register({
      secret: envConfig.jwtSecret,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [MapGateway, MapService],
})
export class MapModule {}
