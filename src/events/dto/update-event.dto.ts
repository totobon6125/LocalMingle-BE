import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  eventName: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  @Min(1)
  maxSize: number;

  @IsNotEmpty()
  @ApiProperty()
  eventDate: Date;

  @IsNotEmpty()
  @ApiProperty()
  signupStartDate: Date;

  @IsNotEmpty()
  @ApiProperty()
  signupEndDate: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '경기도' })
  eventLocation: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '산책' })
  category: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: '🙋‍♀️아무나' })
  isVerified: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  eventImg: string;
}
