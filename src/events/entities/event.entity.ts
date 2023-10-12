import { ApiProperty } from "@nestjs/swagger";
import { Event } from "@prisma/client";

export class EventEntity implements Event {
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

  @ApiProperty()
  category: string;

  @ApiProperty({ required: false, default: false })
  isVerified: boolean;

  @ApiProperty({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
