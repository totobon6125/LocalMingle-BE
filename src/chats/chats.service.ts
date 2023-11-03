import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Socket as SocketModel } from './models/sockets.model';
import { Chatting, Chatting as ChattingModel } from './models/chattings.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRoomRequest } from './interfaces/chats.interface';

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
  //소켓연결 해제
  async disconnectClient(client: Socket, server: Server) {
    // 클라이언트 ID를 기반으로 사용자 정보 조회
    const user = await this.socketModel.findOne({ clientId: client.id });
    if (!user) {
      return server.to(client.id).emit('NotFound_user', NotFoundException);
    }
    const roomId = user.roomId;
    // 클라이언트 ID에 해당하는 사용자를 삭제
    await this.socketModel.findOneAndDelete({ clientId: client.id }).exec();
    // 방 정보 조회
    const room = await this.ChattingModel.findOne({ roomId });
    if (!room) {
      return server.to(client.id).emit('NotFound_room', NotFoundException);
    }
    // 유저리스트에서 클라이언트 ID 제거
    const nickname = room.userList[client.id]?.nickname;
    delete room.userList[client.id];
    // 업데이트된 데이터를 저장
    await this.ChattingModel.findOneAndUpdate(
      { roomId },
      { $set: { userList: room.userList } }
    );

    //await this.leaveRoomRequestToApiServer(roomId);
    // server
    //   .to(String(roomId))
    //   .emit('disconnect_user', `${nickname}의 연결이 종료되었습니다.`);
    this.emitEventForUserList(client, server, roomId, nickname, 'leave_user');
    this.logger.log(`disconnected: ${client.id}`);
  }

  // async leaveRoomRequestToApiServer(uuid: string): Promise<void> {
  //   const headers = {
  //     'socket-secret-key': process.env.SOCKET_SECRET_KEY ?? '',
  //   };
  //   await axios.post(`${baseURL}/room/socket/leave/${uuid}`, undefined, {
  //     headers,
  //   });
  // }

  //유저가 방에 참여
  async joinRoom(client: Socket, server: Server, iRoomRequest: IRoomRequest) {
    const { roomId, nickname, userId } = iRoomRequest;
    //유저를 socketModel 에서 찾습니다.
    const isExist = await this.socketModel.findOne({ userId: userId });
    //만약 유저가 존재하면 클라이언트에게 에러메세지
    if (isExist) {
      //유저가 있으면 방을 나가는 로직
      //await this.leaveRoomRequestToApiServer(roomId);
      return client.emit('joinRoom_Error', '이미 방에 접속한 사용자 입니다.');
    }
    client.leave(client.id);
    client.join(String(roomId));
    const roomData = await this.ChattingModel.findOne({ roomId });
    if (!roomData) {
      await this.createRoom(client, iRoomRequest);
    } else {
      await this.updateRoom(client, roomData, iRoomRequest);
    }
    server
      .to(String(roomId))
      .emit('new-user', `${nickname} 유저가 채팅방에 참가하였습니다.`);
    this.emitEventForUserList(client, server, roomId, nickname, 'new-user');
  }

  //채팅방을 만듬
  async createRoom(
    client: Socket,
    { nickname, roomId, profileImg, userId }: IRoomRequest
  ) {
    const newRoom = { roomId: roomId, user: client.id, userList: {} };
    newRoom.userList = { [client.id]: { nickname, profileImg } };
    await this.ChattingModel.create(newRoom);
    const newUser = {
      clientId: client.id,
      roomId: roomId,
      nickname: nickname,
      userId: userId,
    };
    await this.socketModel.create(newUser);
  }

  //채팅방을 참여하는 사용자 정보 업데이트
  async updateRoom(
    client: Socket,
    roomData: any,
    { roomId, nickname, profileImg, userId }: IRoomRequest
  ) {
    // 새로운 사용자 정보를 준비합니다.
    const newUser = {
      clientId: client.id,
      roomId,
      nickname,
      userId,
    };
    //newUser를 socketModel을 사용하여 db에 저장
    await this.socketModel.create(newUser);
    const findEventRoom = roomData;
    //클라이언트 키를 사용해서 nickname, profileImg를 업데이트
    findEventRoom.userList[client.id] = { nickname, profileImg };
    //findOneAndUpdate 몽고디비에서 roomId와 일치하는 채팅방을 찾아서 유저리스트를 업데이트하여 저장
    await this.ChattingModel.findOneAndUpdate(
      { roomId },
      // $set 연산자로 userList 를 업데이트
      { $set: { userList: findEventRoom.userList } }
    );
  }

  // 사용자 목록 업데이트 이벤트 전송
  async emitEventForUserList(
    client: Socket,
    server: Server,
    roomId: number, // 채팅방의 고유 식별자
    nickname: string, // 사용자의 닉네임
    userEvent: string // 전송할 이벤트의 이름 (예: 'new-user' 또는 'leave-user')
  ) {
    // 주어진 roomId로 채팅방 정보 조회
    const data = await this.ChattingModel.findOne({ roomId });

    // 채팅방이 존재하지 않으면 클라이언트에게 'NotFoundException' 에러 메시지를 전송합니다.
    if (!data) {
      return server.to(client.id).emit('NotFound_data', NotFoundException);
    }

    // 채팅방에 있는 사용자 목록을 가져옵니다.
    const userListObj = data['userList'];

    // 사용자 목록을 배열 형태로 변환합니다.
    const userListArr = Object.values(userListObj);

    // 채팅방에 속한 모든 클라이언트에게 사용자 목록 업데이트 이벤트를 전송합니다.
    server.to(String(roomId)).emit(userEvent, { nickname, userListArr });
  }

  //채팅방을 삭제 (클라이언트가 모임을 삭제 할때 이 매서드를 호출하면 채팅창을 삭제합니다.)
  async removeRoom(client: Socket, server: Server, roomId: number) {
    // 주어진 roomId 채팅방을 찾습니다.
    const data = await this.ChattingModel.findOne({ roomId }).exec();

    // 만약 채팅방이 존재하지 않는다면, 클라이언트에게 'NotFoundException' 에러를 전송합니다.
    if (!data) {
      return server.to(client.id).emit('NotFound_data', NotFoundException);
    }

    // 채팅방이 존재하면 삭제 작업을 수행합니다.
    await this.deleteByRoomId(roomId);
  }

  async deleteByRoomId(roomId: number): Promise<Chatting> {
    const result = await this.ChattingModel.findOneAndDelete({ roomId }).exec();
    return result;
  }

  //방을 떠날때
  async leaveRoom(client: Socket, server: Server, roomId: number) {
    // 주어진 roomId로 채팅방 정보 조회
    const room = await this.ChattingModel.findOne({ roomId });
    // 채팅방이 존재하지 않으면 클라이언트에게 'NotFoundException' 에러 메시지를 전송합니다.
    if (!room) {
      return server.to(client.id).emit('NotFound_room', NotFoundException);
    }
    const userId = room.userList[client.id];
    const nickname = room.userList[client.id]?.nickname;

    // 사용자 ID가 존재하면 사용자를 채팅방에서 제거
    if (userId) {
      delete room.userList[client.id];
    } else {
      // 사용자 ID가 존재하지 않으면 클라이언트에게 'NotFoundException' 에러 메시지를 전송합니다.
      return server.to(client.id).emit('NotFound_userId', NotFoundException);
    }
    // 채팅방 업데이트: 사용자 목록 업데이트
    await this.ChattingModel.findOneAndUpdate(
      { roomId },
      { $set: { userList: room.userList } }
    );
    // 사용자 데이터 삭제
    await this.socketModel.deleteOne({ clientId: client.id });

    // 나간 사용자에게 나간 것을 알리기 위한 메시지를 전송합니다.
    server
      .to(String(roomId))
      .emit('left_user', `${nickname} 유저가 채팅방을 떠났습니다.`);
    // 유저리스트 보내주기
    this.emitEventForUserList(client, server, roomId, nickname, 'leave-user');
  }

  // roomId에 해당하는 이전 채팅 내용을 데이터베이스에서 불러옵니다.
  async getChatHistory(roomId: number) {
    const chatHistory = await this.ChattingModel.find({ roomId }).exec();
    return chatHistory;
  }
}
