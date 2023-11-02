import { Module } from '@nestjs/common';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { Chatting, ChattingSchema } from './models/chattings.model';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketSchema, Socket as SocketModel } from './models/sockets.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chatting.name, schema: ChattingSchema },
      { name: SocketModel.name, schema: SocketSchema },
    ]),
  ],
  providers: [ChatsGateway, ChatsService],
})
export class ChatsModule {}
