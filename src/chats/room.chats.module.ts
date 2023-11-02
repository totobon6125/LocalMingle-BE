import { SocketSchema, Socket as SocketModel } from './models/sockets.model';
import { Module } from '@nestjs/common';
import { ChatsGateway } from './room.chats.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Chatting, ChattingSchema } from './models/chattings.model';
import { RoomChatsService } from './room.chats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chatting.name, schema: ChattingSchema },
      { name: SocketModel.name, schema: SocketSchema },
    ]),
  ],
  providers: [ChatsGateway, RoomChatsService],
})
export class ChatsModule {}
