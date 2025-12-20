import { Controller } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // TODO: 요청 CRUD + 응답 API 추가
}
