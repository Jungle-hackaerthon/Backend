import { NotificationEventType } from '../../../common/constants/notification-event-type.js';

// 간단한 알림 메시지 생성
export function resolveNotificationMessage(
  message: string,
  notificationType: NotificationEventType,
) {
  if (notificationType === NotificationEventType.CHAT_MESSAGE) {
    return {
      title: '채팅',
      message,
    };
  }

  if (notificationType === NotificationEventType.PRODUCT_BID) {
    return {
      title: '경매',
      message,
    };
  }

  return {
    title: '알림',
    message,
  };
}
