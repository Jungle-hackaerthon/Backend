import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO: GET /users/:id - 유저 조회
  // TODO: PATCH /users/:id - 유저 업데이트
}
