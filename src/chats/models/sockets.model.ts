import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { SchemaOptions, Document } from 'mongoose';

const options: SchemaOptions = {
  id: false,
  collection: 'sockets', // 데이터 베이스 이름
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
  socketId: string;

  @Prop({ type: Number, ref: 'Event' }) // roomId 추가
  @IsNotEmpty()
  roomId: number; // EventId를 roomId로 참조하여 사용

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string; //사용자 Id

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @Prop()
  profileImg: string; // profileImg 필드 추가
}

export const SocketSchema = SchemaFactory.createForClass(Socket);
