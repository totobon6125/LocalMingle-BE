import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  eventName?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  maxSize?: number;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  eventDate?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  signupStartDate?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  signupEndDate?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  eventLocation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false, default: "no" })
  @IsOptional()
  @IsString()
  isVerified?: string;
}
