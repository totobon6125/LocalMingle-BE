export interface IMessage {
  time?: string;
  roomId: number;
  nickname: string;
  message: string;
  profileImg: string;
}

export interface IRoomRequest {
  nickname: string;
  roomId: number;
  profileImg: string;
  userId?: number;
}
