import { NotificationEventType } from '../../../common/constants/notification-event-type.js';

export class CreateNotificationDto {
  message: string;
  notificationType?: NotificationEventType;
}
