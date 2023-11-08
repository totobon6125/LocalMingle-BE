import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Socket as SocketModel } from './models/sockets.model';
import { Chatting, Chatting as ChattingModel } from './models/chattings.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IuserInfo } from './interfaces/chats.interface';

@Injectable()
export class ChatsService {
  private logger = new Logger('chat');
  constructor(
    @InjectModel(SocketModel.name)
    private readonly socketModel: Model<SocketModel>,
    @InjectModel(ChattingModel.name)
    private readonly ChattingModel: Model<ChattingModel>
  ) {
    this.logger.log('constructor');
  }

  //유저가 방에 참여
  async joinRoom(socket: Socket, server: Server, iuserInfo: IuserInfo) {
    const { roomId, nickname } = iuserInfo;

    // 해당 방 정보를 조회
    const roomData = await this.ChattingModel.findOne({ roomId });
    if (!roomData) {
      // 방 정보가 없으면 새로운 방을 만들고 사용자 정보를 추가
      await this.createRoom(socket, iuserInfo);
    } else {
      // 방 정보가 이미 있는 경우 사용자 정보 업데이트
      await this.updateRoom(socket, roomData, iuserInfo);
    }

    // 사용자 목록을 클라이언트에게 전송하고 새로운 유저가 방에 참가했음을 알림
    this.sendUserListToClient(server, roomId);
    server
      .to(String(roomId))
      .emit('new-user', `${nickname} 유저가 채팅방에 참가하였습니다.`);
  }

  // 방에 속한 유저 목록을 클라이언트에게 전송하는 메서드 ( 객체를 배열로 변환하여 프론트로 반환하는 코드)
  async sendUserListToClient(server: Server, roomId: number) {
    // 해당 방의 정보를 조회
    const room = await this.ChattingModel.findOne({ roomId });
    // 방 정보가 존재하면 유저 목록을 배열로 변환하여 클라이언트에게 전달
    if (room) {
      const userList = Object.values(room.userList); // userList는 객체이므로 배열로 변환
      server.to(String(roomId)).emit('user_list', userList);
    }
  }

  // 방에 속한 유저 목록을 클라이언트에게 전송하는 메서드(객체 그대로 프론트로 반환하는 코드)
  // async sendUserListToClient(server: Server, roomId: number) {
  //   // 해당 방의 정보를 조회
  //   const room = await this.ChattingModel.findOne({ roomId });
  //   // 방 정보가 존재하면 유저 목록을 객체 그대로 클라이언트에게 전달
  //   if (room) {
  //     server.to(String(roomId)).emit('user_list', room.userList);
  //   }
  // }

  //채팅방을 만듬
  async createRoom(
    socket: Socket,
    { nickname, roomId, profileImg, userId }: IuserInfo
  ) {
    const newRoom = {
      roomId: roomId,
      userList: [
        {
          socketId: socket.id,
          userId: userId,
          nickname: nickname,
          profileImg: profileImg,
        },
      ],
    };
    await this.ChattingModel.create(newRoom);
    const newuser = {
      socketId: socket.id,
      roomId: roomId,
      nickname: nickname,
      userId: userId,
    };
    await this.socketModel.create(newuser);
  }

  //채팅방을 참여하는 사용자 정보 업데이트
  async updateRoom(
    socket: Socket,
    roomData: any,
    { roomId, nickname, profileImg, userId }: IuserInfo
  ) {
    const newuser = {
      socketId: socket.id,
      roomId,
      nickname,
      userId,
    };
    await this.socketModel.create(newuser);
    const chatRoom = roomData;
    chatRoom.userList.push({
      socketId: socket.id,
      userId: userId,
      nickname: nickname,
      profileImg: profileImg,
    });
    await this.ChattingModel.findOneAndUpdate(
      { roomId },
      { $set: { userList: chatRoom.userList } }
    );
  }

  async removeRoom(socket: Socket, server: Server, roomId: number) {
    const findChattingRoom = await this.ChattingModel.findOne({
      roomId,
    }).exec();

    if (!findChattingRoom) {
      return server
        .to(socket.id)
        .emit('NotFound-ChattingRoom', new NotFoundException());
    }

    await this.deleteRoom(roomId);
  }

  async deleteRoom(roomId: number): Promise<Chatting> {
    const deleteChattingRoom = await this.ChattingModel.findOneAndDelete({
      roomId,
    }).exec();
    return deleteChattingRoom;
  }

  async leaveRoom(socket: Socket, server: Server) {
    // 클라이언트 ID를 기반으로 사용자 정보 조회
    const user = await this.socketModel.findOne({ socketId: socket.id });
    if (!user) {
      return server
        .to(socket.id)
        .emit('NotFound_user', new NotFoundException());
    }
    const roomId = user.roomId;
    const nickname = user.nickname;

    // 사용자 정보 삭제
    await this.socketModel.findOneAndDelete({ socketId: socket.id }).exec();

    // 방 정보 조회
    const room = await this.ChattingModel.findOne({ roomId });
    if (!room) {
      return server
        .to(socket.id)
        .emit('NotFound_room', new NotFoundException());
    }

    // 사용자를 방에서 삭제하고 유저 리스트 업데이트
    const userIndex = room.userList.findIndex((u) => u.socketId === socket.id);
    if (userIndex !== -1) {
      room.userList.splice(userIndex, 1);
      await this.ChattingModel.findOneAndUpdate(
        { roomId },
        { $set: { userList: room.userList } }
      );

      // 방에서 나간 사용자에게 메시지 보내기
      server
        .to(String(roomId))
        .emit('left_user', `${nickname} 유저가 채팅방을 떠났습니다.`);
    }
  }

  async getChatHistory(roomId: number) {
    const chatHistory = await this.ChattingModel.find({ roomId }).exec();
    return chatHistory;
  }
}

//소켓연결 해제
// async disconnectClient(socket: Socket, server: Server) {
//   // 클라이언트 ID를 기반으로 사용자 정보 조회
//   const user = await this.socketModel.findOne({ socketId: socket.id });
//   if (!user) {
//     return server
//       .to(socket.id)
//       .emit('NotFound_user', new NotFoundException());
//   }
//   const roomId = user.roomId;
//   // 클라이언트 ID에 해당하는 사용자를 삭제
//   await this.socketModel.findOneAndDelete({ socketId: socket.id }).exec();
//   // 방 정보 조회
//   const room = await this.ChattingModel.findOne({ roomId });
//   if (!room) {
//     return server
//       .to(socket.id)
//       .emit('NotFound_room', new NotFoundException());
//   }
//   // 업데이트된 데이터를 저장
//   await this.ChattingModel.findOneAndUpdate(
//     { roomId },
//     { $set: { userList: room.userList } }
//   );
//   // this.emitEventForUserList(socket, server, roomId, nickname, 'leave_user');
//   this.logger.log(`disconnected: ${socket.id}`);
// }

// async leaveRoom(socket: Socket, server: Server, roomId: number) {
//   const room = await this.ChattingModel.findOne({ roomId });
//   if (!room) {
//     return server
//       .to(socket.id)
//       .emit('NotFound_room', new NotFoundException());
//   }
//   const userId = room.userList[socket.id];
//   const nickname = room.userList[socket.id].nickname;

//   if (userId) {
//     delete room.userList[socket.id];
//   } else {
//     return server
//       .to(socket.id)
//       .emit('NotFound_userId', new NotFoundException());
//   }
//   await this.ChattingModel.findOneAndUpdate(
//     { roomId },
//     { $set: { userList: room.userList } }
//   );
//   server
//     .to(String(roomId))
//     .emit('left_user', `${nickname} 유저가 채팅방을 떠났습니다.`);
// }
