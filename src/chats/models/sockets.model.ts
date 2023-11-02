import { IsNotEmpty, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose'; // Types 추가

const options: SchemaOptions = {
  id: false,
  collection: 'sockets',
  timestamps: true,
};

@Schema(options)
export class Socket extends Document {
  @Prop({
    unique: true,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @Prop({ type: Types.ObjectId, ref: 'Event' }) // roomId 추가
  roomId: number; // 이벤트 ID를 저장

  @Prop()
  profileImg: string; // profileImg 필드 추가

  @Prop()
  time: Date; // 타임 필드 추가
}

export const SocketSchema = SchemaFactory.createForClass(Socket);
