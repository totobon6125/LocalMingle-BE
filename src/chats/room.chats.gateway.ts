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
import { RoomChatsService } from './room.chats.service';
// import { IMessage } from './room.chats.interface';
// import { LocalDateTime } from '@js-joda/core';

@WebSocketGateway({ namespace: 'chattings' })
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('chat');

  constructor(
    @InjectModel(Socket.name)
    private readonly socketModel: Model<Socket>,
    private readonly roomChatsService: RoomChatsService
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
    await this.roomChatsService.handleDisconnect(socket);
  }

  // 클라이언트와의 연결이 수립될 때 실행되는 메소드
  // 클라이언트가 연결되면 해당 클라이언트의 ID와 네임스페이스 정보를 로그에 출력
  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`);
  }

  // 클라이언트가 'join_room' 메시지를 보낼 때 실행되는 메소드
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody()
    payload: { nickname: string; eventId: string; profileImg: string },
    @ConnectedSocket() socket: Socket
  ) {
    // 클라이언트가 'join_room' 메시지를 보내면 채팅방에 참여하기 위한 메소드 호출
    await this.roomChatsService.handleJoinRoom(payload, socket);
  }

  // 클라이언트가 'submit_chat' 메시지를 보낼 때 실행되는 메소드
  @SubscribeMessage('submit_chat')
  async handleSubmitChat(
    @MessageBody() chat: string,
    @ConnectedSocket() socket: Socket
  ) {
    // 클라이언트가 'submit_chat' 메시지를 보내면 채팅 메시지를 저장하는 메소드 호출
    await this.roomChatsService.handleSubmitChat(chat, socket);
  }
}
