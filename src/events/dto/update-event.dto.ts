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
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  eventName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  maxSize: number;

  @ApiProperty()
  @IsNotEmpty()
  eventDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  signupStartDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  signupEndDate: Date;

  @ApiProperty({ example: '경기도' })
  @IsNotEmpty()
  @IsString()
  eventLocation: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  content: string;

  @ApiProperty({ example: '산책' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ default: '🙋‍♀️아무나' })
  @IsNotEmpty()
  @IsString()
  isVerified: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  eventImg: string;
}
