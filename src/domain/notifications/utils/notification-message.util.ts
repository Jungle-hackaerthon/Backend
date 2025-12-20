// 간단한 알림 메시지 생성
export function resolveNotificationMessage(message: string) {
  return {
    title: '알림',
    message,
  };
}
