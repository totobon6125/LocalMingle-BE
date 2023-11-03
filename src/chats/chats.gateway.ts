import { Chatting } from './models/chattings.model';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
// import { IMessage } from './room.chats.interface';
// import { LocalDateTime } from '@js-joda/core';
@WebSocketGateway({
  namespace: 'chattings',
  cors: {
    origin: [
      'http://localhost:5173',
      'https://d2r603zvpf912o.cloudfront.net',
      'https://totobon.store',
      'https://local-mingle-fe.vercel.app',
      'https://https://localmingle.store',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('chat');
  constructor(
    @InjectModel(Chatting.name) private readonly chattingModel: Model<Chatting>,
    @InjectModel(Socket.name)
    private readonly socketModel: Model<Socket>
  ) {
    this.logger.log('constructor');
  }
  // WebSocketGateway가 초기화될 때 실행되는 메소드
  // WebSocketGateway가 초기화되면 로그를 출력합니다.
  afterInit() {
    this.logger.log('init');
  }
  // 클라이언트와의 연결이 해제될 때 실행되는 메소드
  // 클라이언트 소켓 연결이 끊기면 roomChatsService의 handleDisconnect 메소드 호출
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.socketModel.findOne({ id: socket.id });
    if (user) {
      socket.broadcast.emit('disconnect_user', user.data);
      await user.deleteOne();
    }
    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`);
    // this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`);
    // await this.roomChatsService.handleDisconnect(socket);
    // this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`);
  }
  // 클라이언트와의 연결이 수립될 때 실행되는 메소드
  // 클라이언트가 연결되면 해당 클라이언트의 ID와 네임스페이스 정보를 로그에 출력
  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`);
    // await this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`);
  }
  // 클라이언트가 'join_room' 메시지를 보낼 때 실행되는 메소드
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody()
    payload: { nickname: string; roomId: number; profileImg: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(String(payload.roomId));
    this.logger.log(
      `Joined room: ${payload.roomId}, Nickname: ${payload.nickname}`
    );
    this.server.to(String(payload.roomId)).emit('user_connected', payload);
  }

  // 클라이언트가 'submit_chat' 메시지를 보낼 때 실행되는 메소드
  @SubscribeMessage('submit_chat')
  async handleSubmitChat(
    @MessageBody()
    messageData: {
      message: string;
      nickname: string;
      profileImg: string;
      time: string;
      roomId: number;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() _socket: Socket
  ) {
    this.logger.log(
      `New chat in room ${messageData.roomId}: ${messageData.message}`
    );

    const socketObj = await this.socketModel.findOne({ id: _socket.id });

    // MongoDB에 채팅 메시지 저장
    await this.chattingModel.create({
      user: socketObj,
      nickname: messageData.nickname,
      profileImg: messageData.profileImg,
      roomId: messageData.roomId,
      time: messageData.time,
      chat: messageData.message, // 수정: messageData.message를 사용하여 채팅 저장
    });

    this.server.to(String(messageData.roomId)).emit('new_chat', messageData);
  }
}
