import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty()
  @IsInt()
  @ApiProperty({
    description: 'code',
    example: '12345',
  })
  code: number;
}
