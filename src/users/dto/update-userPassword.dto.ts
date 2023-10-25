// src/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPasswordDto {
  @ApiProperty({
    example: '1234', // 예시 값을 설정
    description: 'The password of the user for password update',
  })
  password: string;
}
