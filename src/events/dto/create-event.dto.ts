import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDate,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  eventName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  maxSize: number;

  @ApiProperty()
  eventDate: Date;

  @ApiProperty()
  signupStartDate: Date;

  @ApiProperty()
  signupEndDate: Date;

  @ApiProperty()
  @IsString()
  eventLocation: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  content: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsBoolean()
  isDeleted: boolean = false;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
