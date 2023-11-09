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
  private logger = new Logger('chat');

  private userList: Array<{
    nickname: string;
    profileImg: string;
    userId: number;
  }> = [];

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

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.socketModel.findOne({ id: socket.id });
    if (user) {
      socket.broadcast.emit('disconnect_user', user);
      await user.deleteOne();

      // userList에서 해당 유저 정보 제거
      this.userList = this.userList.filter(
        (u) => u.userId !== user.data.userId
      );
      socket.broadcast.emit('userList', this.userList);
    }
    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`);
  }

  // 클라이언트가 연결되면 해당 클라이언트의 ID와 네임스페이스 정보를 로그에 출력
  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`);
    // await this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`);
  }
  // 클라이언트가 'join_room' 메시지를 보낼 때 실행되는 메소드
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody()
    payload: {
      nickname: string;
      roomId: number;
      profileImg: string;
      userId: number;
    },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(String(payload.roomId));
    this.logger.log(
      `Joined room: ${payload.roomId}, Nickname: ${payload.nickname}`
    );

    //이전 채팅 내용을 불러옵니다.
    const chatHistory = await this.getChatHistory(payload.roomId);

    // userList에 사용자 정보 추가
    this.userList.push({
      nickname: payload.nickname,
      profileImg: payload.profileImg,
      userId: payload.userId,
    });

    // 이전 채팅 내용과 함께 사용자 정보를 클라이언트에게 전송합니다.
    socket.emit('chat_history', chatHistory);
    // 방에 있는 모든 사용자에게 userList 전송
    this.server.to(String(payload.roomId)).emit('user_connected', payload);
    this.server.to(String(payload.roomId)).emit('userList', this.userList);
  }

  // 방에서 적었던 채팅 내용을 불러오는 매서드
  async getChatHistory(roomId: number) {
    const chatHistory = await this.chattingModel.find({ roomId }).exec();
    return chatHistory;
  }

  // 클라이언트가 'submit_chat' 메시지를 보낼 때 실행되는 메소드 (채팅을하고 그걸 다른유저에게 브로드캐스팅)
  @SubscribeMessage('submit_chat')
  async handleSubmitChat(
    @MessageBody()
    messageData: {
      message: string;
      nickname: string;
      profileImg: string;
      time: string;
      roomId: number;
      userId: number;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() _socket: Socket
  ) {
    this.logger.log(
      `New chat in room ${messageData.roomId}: ${messageData.message}`
    );

    // const socketObj = await this.socketModel.findOne({ id: _socket.id });
    const { nickname, profileImg, userId } = messageData;
    const userList = [
      {
        userId: userId,
        nickname: nickname,
        profileImg: profileImg,
      },
    ];
    // const userList = await this.socketModel.find({ nickname: { $in: [nickname] } });
    // MongoDB에 채팅 메시지 저장
    await this.chattingModel.create({
      userList: userList,
      // user: socketObj,
      nickname: messageData.nickname,
      profileImg: messageData.profileImg,
      roomId: messageData.roomId,
      time: messageData.time,
      chat: messageData.message, // 수정: messageData.message를 사용하여 채팅 저장
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
} // 끝
