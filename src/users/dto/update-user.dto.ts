// src/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
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

  @IsString()
  @ApiProperty({
    description: 'intro',
    example: '안녕하세요',
  })
  intro: string;

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
    description: 'password confirm',
    example: 'abc123456789!',
  })
  confirmPassword: string;

  @ApiProperty({
    description: 'nickname changed',
    example: false,
  })
  nameChanged: boolean;
}
