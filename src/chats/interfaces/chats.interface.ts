export interface IMessage {
  time?: string;
  roomId: number;
  userId: number;
  nickname: string;
  message: string;
  profileImg: string;
}

export interface IuserInfo {
  nickname: string;
  roomId: number;
  profileImg: string;
  userId?: number;
}
