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
  @ApiProperty({
    example: '같이 산책하실분',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  eventName: string;

  @ApiProperty({
    example: 10,
  })
  @IsNotEmpty()
  @IsInt()
  maxSize: number;

  @ApiProperty()
  eventDate: Date;

  @ApiProperty()
  signupStartDate: Date;

  @ApiProperty()
  signupEndDate: Date;

  @ApiProperty({
    example: "서울특별시"
  })
  @IsString()
  eventLocation: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  content: string;

  @ApiProperty({
    example: "산책"
  })
  @IsString()
  category: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  isDeleted: boolean = false;

  @ApiProperty({ required: false, default: 'no' })
  @IsOptional()
  @IsString()
  isVerified?: string;
}
