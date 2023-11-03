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
  // @Prop({
  //   type: {
  //     _id: { type: Types.ObjectId, required: true, ref: 'sockets' },
  //     userId: { type: Number },
  //     nickname: { type: String, required: true },
  //     profileImg: { type: String }, // 추가: 프로필 이미지
  //     roomId: { type: Number }, // 추가: 방 ID 또는 방 식별자
  //   },
  // })
  // @IsNotEmpty()
  // user: SocketModel; // 이코드는 필요없을 수도 있습니다. 기존코드때문에 임시로 넣음

  //모임방 id값 EventId를 roomId로 변환하여 쓰고 있음
  @Prop({
    required: true,
    ref: 'Event',
  })
  @IsNotEmpty()
  @IsString()
  roomId: number;

  @Prop({ type: Object, required: true })
  @IsNotEmpty()
  @IsString() // userList의 타입을 명시적으로 지정
  userList: object; // 유저 리스트에는 nickname , profileImg , userId 가
}

export const ChattingSchema = SchemaFactory.createForClass(Chatting);
