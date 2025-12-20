import {
  Body,
  Controller,
  MessageEvent,
  Param,
  Patch,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream/:userId')
  @UseGuards(JwtAuthGuard)
  stream(@UserId() userId: string): Observable<MessageEvent> {
    return this.createStream(userId);
  }

  @Sse('stram/:userId')
  @UseGuards(JwtAuthGuard)
  stram(@UserId() userId: string): Observable<MessageEvent> {
    return this.createStream(userId);
  }

  private createStream(userId: string): Observable<MessageEvent> {
    return this.notificationsService.subscribe(userId).pipe(
      map((notification) => ({
        data: notification,
        type: notification.notificationType || 'notification',
      })),
      finalize(() => {
        this.notificationsService.unsubscribe(userId);
      }),
    );
  }

  /* 알림 읽음 - 필드하나만 바뀔일 없으니 걍 read */
  @Patch(':notificationId/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(
    @Param('notificationId') notificationId: string,
    @UserId() userId: string,
  ) {
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  /* 테스트용 알림 생성 - 실제론 다른 모듈에서 불러옴 */
  @Post()
  async create(
    @UserId() userId: string,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(
      userId,
      createNotificationDto.message,
      createNotificationDto.notificationType,
    );
  }
}
