/**
 * Map Socket 이벤트 상수 정의
 */
export enum MapSocketEvents {
  // 맵 입장/퇴장
  MAP_JOIN = 'map:join',
  MAP_LEAVE = 'map:leave',
  MAP_MOVE = 'map:move',

  // 유저 이벤트
  USERS_LIST = 'users:list',
  USER_JOINED = 'user:joined',
  USER_MOVED = 'user:moved',
  USER_LEFT = 'user:left',

  // 상품(상점) 이벤트
  PRODUCT_CREATED = 'product:created',
  PRODUCT_UPDATED = 'product:updated',
  PRODUCT_REMOVED = 'product:removed',

  // 경매 입찰 이벤트
  BID_CREATED = 'bid:created',
  BID_REMOVED = 'bid:removed',
}
