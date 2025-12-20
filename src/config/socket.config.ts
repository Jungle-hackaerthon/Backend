/**
 * Socket.IO 공통 설정
 * 기본 Socket.IO adapter 사용 (단일 서버)
 */
export const socketConfig = {
  cors: {
    origin: '*', // TODO: 프로덕션에서는 특정 도메인으로 제한
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
};
