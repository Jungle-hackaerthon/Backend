import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            markAsRead: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(
      NotificationsService,
    ) as jest.Mocked<NotificationsService>;
  });

  describe('stream', () => {
    it('subscribes to a user stream and unsubscribes once the SSE completes', async () => {
      const userId = 'user-123';
      const subject = new Subject<Notification>();
      service.subscribe.mockReturnValue(subject);

      const stream$ = controller.stream(userId);

      expect(service.subscribe).toHaveBeenCalledWith(userId);

      const emitted: Notification[] = [];
      const finished = new Promise<void>((resolve) => {
        stream$.subscribe({
          next: (value) => emitted.push(value),
          complete: resolve,
        });
      });

      const payload = {
        id: 'notif-1',
        message: 'hello',
      } as Notification;

      subject.next(payload);
      subject.complete();

      await finished;

      expect(emitted).toEqual([payload]);
      expect(service.unsubscribe).toHaveBeenCalledWith(userId);
    });
  });
});
