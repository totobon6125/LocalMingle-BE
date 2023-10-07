import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty()
  eventId: number;

  @ApiProperty()
  eventName: string;

  @ApiProperty()
  maxSize: number;

  @ApiProperty()
  eventDate: Date;

  @ApiProperty()
  signupStartDate: Date;

  @ApiProperty()
  signupEndDate: Date;

  @ApiProperty()
  eventLocation: string;

  @ApiProperty()
  content: string;

  @ApiProperty({required: false, default: false})
  isVerified?: boolean = false
}
