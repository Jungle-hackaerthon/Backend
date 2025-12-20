// TODO: Redis adapter 설정 (현재는 주석 처리)
// import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
// import { envConfig } from './env.config';

export const socketConfig = {
  cors: {
    origin: '*', // TODO: 프로덕션에서는 특정 도메인으로 제한
    credentials: true,
  },
  transports: ['websocket', 'polling'],
};

// TODO: Redis adapter 적용 예시
// export async function setupRedisAdapter(io: Server) {
//   const pubClient = createClient({ url: envConfig.redisUrl });
//   const subClient = pubClient.duplicate();
//
//   await Promise.all([pubClient.connect(), subClient.connect()]);
//
//   io.adapter(createAdapter(pubClient, subClient));
// }
