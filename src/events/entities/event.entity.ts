import { ApiProperty } from '@nestjs/swagger';

export class EventEntity  {
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
  location_City: string;

  @ApiProperty()
  location_District: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ required: false, default: '🙋‍♀️아무나' })
  isVerified: string;

  @ApiProperty({ required: false, default: null})
  eventImg: string;

  @ApiProperty({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
