// src/users/dto/create-user-detail.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

/*
// 사용자 정보 모델
model UserDetail {
  userDetailId Int     @id @default(autoincrement()) // Primary Key
  UserId       Int // Foreign Key
  nickname     String  @unique
  intro        String?
  profileImg   String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  User User @relation(fields: [UserId], references: [userId])

  @@map("UserInfo")
}
*/

export class CreateUserDetailDto {
  @ApiProperty({
    example: 'nickname1',
    description: 'The nickname of the user',
  })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ApiProperty({
    example: 'Hello, I am user1',
    description: 'The introduction of the user',
  })
  @IsOptional()
  @IsString()
  intro?: string;

  @ApiProperty({
    example: 'profile.jpg',
    description: 'The profile image of the user',
  })
  @IsOptional()
  @IsString()
  profileImg?: string;
}
