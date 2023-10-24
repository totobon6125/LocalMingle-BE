// src/users/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'email',
    example: 'test1@naver.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(15)
  //알파벳 포함 , 숫자 포함 , 특수문자 포함
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  @ApiProperty({
    description: 'password',
    example: 'abc123456789!',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'password',
    example: 'abc123456789!',
  })
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(8)
  //영어 또는 한글이 포함
  @Matches(/^(?=.*[A-Za-z가-힣]).*[A-Za-z가-힣0-9]*$/)
  @ApiProperty({
    description: 'nickname',
    example: '닉네임',
  })
  nickname: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'intro',
    example: '안녕하세요',
  })
  intro?: string;

  /*  @IsOptional() */
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'profileImg',
    example: '프로필이미지 url',
  })
  profileImg?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'refreshToken',
    example: 'refreshToken',
  })
  refreshToken?: string;
}
