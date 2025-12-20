import { Controller } from '@nestjs/common';
import { PointsService } from './points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  // TODO: 포인트 적립/차감 API 추가
}
