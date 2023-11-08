import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions } from 'mongoose';
// import { Socket as SocketModel } from './sockets.model';

const options: SchemaOptions = {
  collection: 'chattings',
  timestamps: true,
};

@Schema(options)
export class Chatting extends Document {
  @Prop({
    type: [
      {
        userId: { type: Number, required: true },
        nickname: { type: String, required: true },
        profileImg: { type: String, required: true },
        socketId: { type: String, required: false },
        roomId: { type: Number, required: false },
      },
    ],
  })
  @IsNotEmpty()
  userList: Array<{
    socketId: string;
    userId?: number;
    nickname: string;
    profileImg?: string;
    roomId?: number;
  }>;

  //모임방 id값 EventId를 roomId로 변환하여 쓰고 있음
  @Prop({
    required: true,
    ref: 'Event',
  })
  @IsNotEmpty()
  @IsString()
  roomId: number;

  // @Prop({ type: Object, required: true })
  // @IsNotEmpty()
  // userList: object; // 유저 리스트에는 nickname , profileImg , userId 가

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}

export const ChattingSchema = SchemaFactory.createForClass(Chatting);
