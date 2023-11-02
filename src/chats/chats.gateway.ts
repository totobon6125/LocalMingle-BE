import { Logger } from '@nestjs/common';
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
import { Socket, Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { IMessage, IRoomRequest } from './interfaces/chats.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocalDateTime } from '@js-joda/core';
import { Chatting } from './models/chattings.model';

@WebSocketGateway({
  namespace: 'chattings',
  cors: true,
  allowEIO3: true,
})
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  //의존성 주입
  @InjectModel(Chatting.name) private readonly chattingModel: Model<Chatting>;
  constructor(private readonly chatsService: ChatsService) {}

  //유저가 연결 되었을때 기존은 socket: Socket
  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  //유저가 연결해제 되었을때 로직
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`disconnected: ${client.id}`);
    this.chatsService.disconnectClient(client, this.server);
  }

  // 클라이언트가 'submit_chat' 메시지를 보낼 때 실행되는 메소드 (채팅을하고 그걸 다른유저에게 브로드캐스팅)
  @SubscribeMessage('submit_chat')
  async handleSubmitChat(
    @MessageBody() { roomId, nickname, profileImg, message }: IMessage
  ): Promise<void> {
    const localDateTime = LocalDateTime.now().plusHours(9);
    const period = localDateTime.hour() < 12 ? 'AM' : 'PM';
    const formattedHour = localDateTime.hour() % 12 || 12;
    const minute = localDateTime.minute().toString().padStart(2, '0');
    const messageData: IMessage = {
      message,
      time: `${formattedHour}:${minute} ${period}`,
      nickname,
      roomId,
      profileImg,
    };

    //const socketObj = await this.socketModel.findOne({ Socket });

    // MongoDB에 채팅 메시지 저장
    await this.chattingModel.create({
      // user: socketObj, // 메세지를보낸 소켓 정보
      nickname: messageData.nickname, //메세지를 보낸 사용자의 닉네임
      profileImg: messageData.profileImg, //메세지를 보낸 사용자의 프로필 이미지
      roomId: messageData.roomId, // 채팅이 속한 방의 ID
      time: messageData.time, // 메세지를 송신한 시간
      chat: messageData.message, // 실제 채팅 메시지 내용.
      created: new Date(), // 채팅 생성 시간 기록
    });

    this.logger.log(messageData);
    this.server.to(String(messageData.roomId)).emit('new_chat', messageData);
  }

  // 일정기간(3일)이 지난 채팅을 db에서 삭제
  async deleteOldChats() {
    // 72시간(3일) 이상 지난 채팅 삭제
    const chatScheduler = new Date();
    // chatScheduler.setDate(chatScheduler.getDate() - 3); //3일
    //chatScheduler.setHours(chatScheduler.getHours() - 72); // 72시간
    chatScheduler.setMinutes(chatScheduler.getMinutes() - 2); // 4320분(3일) 테스트 2분
    await this.chattingModel.deleteMany({ created: { $lt: chatScheduler } });
  }

  // 유저가 방에 참석할때
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { nickname, roomId, profileImg, userId }: IRoomRequest
  ): Promise<void> {
    client.leave(client.id);
    client.join(String(roomId));

    // 이전 채팅 내용을 불러옵니다.
    const chatHistory = await this.chatsService.getChatHistory(roomId);

    // 이전 채팅 내용과 함께 사용자 정보를 클라이언트에게 전송합니다.
    client.emit('chat_history', chatHistory);
    this.chatsService.joinRoom(client, this.server, {
      nickname,
      roomId,
      profileImg,
      userId,
    });
  }

  // 유저가 방을 삭제할때
  @SubscribeMessage('remove_room')
  handleRemoveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: IRoomRequest
  ): void {
    this.chatsService.removeRoom(client, this.server, roomId);
  }

  // 유저가 방을 떠날때
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: IRoomRequest
  ): void {
    client.leave(String(roomId));
    this.chatsService.leaveRoom(client, this.server, roomId);
  }

  // WebSocketGateway가 초기화될 때 실행되는 메소드
  // WebSocketGateway가 초기화되면 로그를 출력합니다.
  afterInit() {
    this.logger.log('init');
  }
} // 끝
