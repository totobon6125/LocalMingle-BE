import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  eventName: string;

  @ApiProperty()
  @IsInt()
  maxSize: number;

  @ApiProperty()
  @IsDate()
  eventDate: Date;

  @ApiProperty()
  @IsDate()
  signupStartDate: Date;

  @ApiProperty()
  @IsDate()
  signupEndDate: Date;

  @ApiProperty()
  @IsString()
  eventLocation: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsBoolean()
  isDeleted: boolean = false;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  isVerified?: boolean;
}
