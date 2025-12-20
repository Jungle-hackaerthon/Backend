import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { from, Observable, Subject } from 'rxjs';

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
      return existing;
    }

    return this.createStream(userId);
  }
  /* 알림 생성 */
  async create(userId: string, message: string): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      user: { id: userId },
      message,
    });
    const saved = await this.notificationsRepository.save(notification);
    const stream = this.userStreams.get(userId);
    if (stream) {
      stream.next(saved);
    }

    return saved;
  }

  /* 알림 읽음 처리 */
  markAsRead(notificationId: string): Promise<void> {
    return this.notificationsRepository
      .update({ id: notificationId }, { isRead: true })
      .then(() => {});
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
