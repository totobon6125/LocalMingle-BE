import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chatting } from './models/chattings.model';
import { Socket as SocketModel } from './models/sockets.model';
@Injectable()
export class RoomChatsService {
  constructor(
    @InjectModel(SocketModel.name)
    private readonly socketModel: Model<SocketModel>,
    @InjectModel(Chatting.name)
    private readonly chattingModel: Model<Chatting>
  ) {}
  // 클라이언트 소켓의 연결이 끊겼을 때 호출되는 메서드
  async handleDisconnect(socket: Socket) {
    const user = await this.socketModel.findOne({ id: socket.id });
    if (user) {
      // 연결 해제한 사용자를 MongoDB에서 삭제
      await this.socketModel.deleteOne({ _id: user._id });
    }
  }
  // 채팅방에 참여하는 메서드
  async handleJoinRoom(
    payload: { nickname: string; roomId: number; profileImg: string },
    socket: Socket
  ) {
    const data = await this.socketModel.findOne({ id: socket.id });
    if (!data) {
      // 사용자가 채팅방에 처음 참여할 때, 채팅방 정보를 생성
      await this.createRoom(socket, payload);
    } else {
      // 이미 채팅방에 참여한 사용자인 경우, 사용자 정보 업데이트
      await this.updateRoom(socket, data.roomId, payload);
    }
  }
  // 채팅 메시지를 저장하는 메서드
  async handleSubmitChat(chat: string, socket: Socket) {
    const socketObj = await this.socketModel.findOne({ id: socket.id });
    // MongoDB에 채팅 메시지를 저장합니다.
    await this.chattingModel.create({
      user: socketObj,
      chat,
      roomId: socketObj.roomId,
      nickname: socketObj.nickname,
      profileImg: socketObj.profileImg,
      time: socketObj.time,
    });
  }

  // 채팅방 정보를 생성하는 메서드
  async createRoom(
    socket: Socket,
    payload: { nickname: string; roomId: number; profileImg: string }
  ) {
    const newUser = {
      id: socket.id,
      nickname: payload.nickname,
      roomId: payload.roomId,
    };
    await this.socketModel.create(newUser);
  }

  // 채팅방 정보를 업데이트하는 메서드
  async updateRoom(
    socket: Socket,
    roomId: number,
    payload: { nickname: string; profileImg: string }
  ) {
    const socketObj = await this.socketModel.findOne({ id: socket.id });
    if (socketObj && socketObj.roomId === roomId) {
      // 이미 채팅방에 참여한 사용자인 경우, 사용자 정보를 업데이트
      socketObj.nickname = payload.nickname;
      socketObj.profileImg = payload.profileImg;
      await socketObj.save();
    }
  }
}
