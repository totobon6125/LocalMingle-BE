// src/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @ApiProperty({
    example: '1234', // 예시 값을 설정
    description: 'The password of the user for account deletion',
  })
  password: string;
}
