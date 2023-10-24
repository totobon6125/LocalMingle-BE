import { ApiProperty } from '@nestjs/swagger';

export class SendMailDto {
  @ApiProperty({
    description: 'to',
    example: 'test1@naver.com',
  })
  to: string;

  @ApiProperty({
    description: 'subject',
    example: 'local-mingle 인증메일입니다.',
  })
  subject: string;

  @ApiProperty()
  html: string;
}
