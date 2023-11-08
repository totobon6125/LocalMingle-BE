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
import { IMessage, IuserInfo } from './interfaces/chats.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chatting } from './models/chattings.model';

@WebSocketGateway({
  namespace: 'chattings',
  // cors:true
  cors: {
    origin: [
      'http://localhost:5173',
      'https://d2r603zvpf912o.cloudfront.net',
      'https://totobon.store',
      'https://local-mingle-fe.vercel.app',
      'https://d2k8kob2tp4v96.cloudfront.net',
      'https://localmingle.store',
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'HEAD'],
    credentials: true,
    allowEIO3: true,
  },
})
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('chat');

  //의존성 주입
  @InjectModel(Chatting.name) private readonly chattingModel: Model<Chatting>;
  constructor(private readonly chatsService: ChatsService) {}

  //유저가 연결 되었을때 기존은 socket: Socket
  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
  }

  //유저가 연결해제 되었을때 로직
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`disconnected: ${socket.id}`);
    this.chatsService.leaveRoom(socket, this.server);
  }

  // 클라이언트가 'submit_chat' 메시지를 보낼 때 실행되는 메소드 (채팅을하고 그걸 다른유저에게 브로드캐스팅)
  @SubscribeMessage('submit_chat')
  async handleSubmitChat(
    @MessageBody() messageData: IMessage,
    @ConnectedSocket() socket: Socket
  ): Promise<void> {
    const userId = messageData.userId;
    const { roomId, nickname, profileImg, message, time } = messageData;
    // 이 메서드에서 userList를 사용자 정보 배열로 처리하고 MongoDB에 저장하는 방식을 변경해야 합니다.
    const user = {
      socketId: socket.id,
      userId: userId,
      nickname: nickname,
      profileImg: profileImg,
      roomId: roomId,
    };
    // MongoDB에 채팅 메시지 저장
    // user 정보를 userList 배열에 추가
    await this.chattingModel.create({
      userList: [user],
      time: time,
      message: message,
      created: new Date(),
    });

    // MongoDB에 채팅 메시지 저장
    await this.chattingModel.create({
      //userList, // 메세지를보낸 소켓 정보
      nickname: messageData.nickname, //메세지를 보낸 사용자의 닉네임
      profileImg: messageData.profileImg, //메세지를 보낸 사용자의 프로필 이미지
      roomId: messageData.roomId, // 채팅이 속한 방의 ID
      time: messageData.time, // 메세지를 송신한 시간
      message: messageData.message, // 실제 채팅 메시지 내용.
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
    chatScheduler.setHours(chatScheduler.getHours() - 72); // 72시간
    // chatScheduler.setMinutes(chatScheduler.getMinutes() - 2); // 4320분(3일) 테스트 2분
    await this.chattingModel.deleteMany({ created: { $lt: chatScheduler } });
  }

  // 유저가 방에 참석할때
  @SubscribeMessage('join_room') // 조인룸으로 태현님이 보내면 받는 on
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { nickname, roomId, profileImg, userId }: IuserInfo
  ): Promise<void> {
    // 이전 채팅 내용을 불러옵니다.
    const chatHistory = await this.chatsService.getChatHistory(roomId);

    // 이전 채팅 내용과 함께 사용자 정보를 클라이언트에게 전송합니다.
    socket.emit('chat_history', chatHistory);

    const userList = {
      nickname,
      roomId,
      profileImg,
      userId,
    };
    const previousUserList = socket['userList'];

    // 사용자가 이미 다른 방에 참가한 경우
    if (previousUserList) {
      // 이전 방에서 사용자를 나가게 처리
      this.chatsService.leaveRoom(socket, this.server);
    }

    // 현재 방에 사용자를 참가하게 처리
    this.chatsService.joinRoom(socket, this.server, {
      nickname,
      roomId,
      profileImg,
      userId,
    });

    socket['userList'] = userList;
  }

  // 유저가 방을 삭제할때
  @SubscribeMessage('remove_room')
  async handleRemoveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomId }: IuserInfo
  ): Promise<void> {
    await this.chatsService.removeRoom(socket, this.server, roomId);
  }

  //handleDisconnect 와 코드를 통합해서 삭제예정(주석처리)
  // // 유저가 방을 떠날때
  // @SubscribeMessage('leave_room')
  // async handleLeaveRoom(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() { roomId }: IuserInfo
  // ): Promise<void> {
  //   socket.leave(String(roomId));
  //   await this.chatsService.leaveRoom(socket, this.server, roomId);
  // }

  // WebSocketGateway가 초기화될 때 실행되는 메소드
  // WebSocketGateway가 초기화되면 로그를 출력합니다.
  afterInit() {
    this.logger.log('init');
  }
} // 끝
