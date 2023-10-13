//src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email',
    example: 'sabin@aDams.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'name',
    example: '희용',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'Password',
    example: 'password-sabin',
  })
  password: string;
}
