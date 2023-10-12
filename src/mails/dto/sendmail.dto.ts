import { ApiProperty } from '@nestjs/swagger';

export class SendMailDto {
  @ApiProperty()
  to: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  html: string;
}
