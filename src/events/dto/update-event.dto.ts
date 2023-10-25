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
  @IsOptional()
  eventDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  signupStartDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  signupEndDate?: Date;

  @ApiProperty({ required: false, example: '경기도' })
  @IsString()
  @IsOptional()
  eventLocation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false, example: '산책' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false, default: '🙋‍♀️아무나' })
  @IsOptional()
  @IsString()
  isVerified?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  eventImg?: string;
}
