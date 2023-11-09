import { IsNotEmpty, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';
// import { Socket as SocketModel } from './sockets.model';
const options: SchemaOptions = {
  collection: 'chattings', // 데이터 베이스 이름
  timestamps: true,
};
@Schema(options)
export class Chatting extends Document {
  // @Prop({
  //   type: {
  //     _id: { type: Types.ObjectId, required: true, ref: 'sockets' },
  //     id: { type: String },
  //     nickname: { type: String, required: true },
  //     profileImg: { type: String }, // 추가: 프로필 이미지
  //     roomId: { type: Number }, // 추가: 방 ID 또는 방 식별자
  //     time: { type: Date },
  //   },
  // })
  // @IsNotEmpty()
  // userList: SocketModel;
  @Prop({
    ref: 'Event',
  })
  @IsNotEmpty()
  @IsString()
  roomId: number;
  @Prop({
    type: [
      {
        userId: Number,
        nickname: String,
        profileImg: String,
      },
    ],
    required: true,
  })
  userList: Record<string, any>[];

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  chat: string;
}
export const ChattingSchema = SchemaFactory.createForClass(Chatting);
