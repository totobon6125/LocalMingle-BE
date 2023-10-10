// src/users/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
} from 'class-validator';

// model User {
//   userId    Int      @id @default(autoincrement()) // Primary Key
//   email     String   @unique
//   password  String
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   UserDetail  UserDetail[]
//   HostEvents  HostEvent[]
//   GuestEvents GuestEvent[]

//   @@map("User")
// }

export class CreateUserDto {
  @ApiProperty({
    example: 'user1@email.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    example: 'Password1!',
    description: 'The password of the user',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: '패스워드는 최소 8자리 이상이어야 합니다.' })
  @MaxLength(15, { message: '패스워드는 최대 15자리까지 가능합니다.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/, {
    message: '패스워드는 8-15 글자, 영문/숫자/특수문자가 포함되어야 합니다.',
  })
  password: string;
}
