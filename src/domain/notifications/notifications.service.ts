import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { Observable, Subject } from 'rxjs';
import { resolveNotificationMessage } from './utils/notification-message.util';
import { NotificationEventType } from '../../common/constants/notification-event-type.js';

@Injectable()
export class NotificationsService {
  private userStreams = new Map<string, Subject<Notification>>();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}
  /* 알림 구독 */
  subscribe(userId: string): Observable<Notification> {
    const existing = this.getStream(userId);
    if (existing) {
      return existing.asObservable();
    }

    return this.createStream(userId).asObservable();
  }
  /* 알림 생성 */
  async create(
    userId: string,
    message: string,
    notificationType: NotificationEventType = NotificationEventType.CHAT_MESSAGE,
  ): Promise<Notification> {
    const { title, message: formattedMessage } =
      resolveNotificationMessage(message, notificationType);
    const notification = this.notificationsRepository.create({
      user: { id: userId },
      title,
      message: formattedMessage,
      notificationType,
    });
    const saved = await this.notificationsRepository.save(notification);
    const stream = this.userStreams.get(userId);
    if (stream) {
      stream.next(saved);
    }

    return saved;
  }

  /* 알림 읽음 처리 */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });

    if (notification && notification.user.id === userId) {
      await this.notificationsRepository.update(
        { id: notificationId },
        { isRead: true },
      );
    }
  }

  unsubscribe(userId: string) {
    const stream = this.userStreams.get(userId);
    if (stream) {
      stream.complete();
      this.userStreams.delete(userId);
    }
  }

  private getStream(userId: string): Subject<Notification> | undefined {
    return this.userStreams.get(userId);
  }

  private createStream(userId: string): Subject<Notification> {
    const created = new Subject<Notification>();
    this.userStreams.set(userId, created);
    return created;
  }
}
