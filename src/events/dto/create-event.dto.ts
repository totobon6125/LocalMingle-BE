import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '같이 산책하실분',
  })
  @MaxLength(50)
  eventName: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    example: 10,
  })
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
  @ApiProperty({
    example: '서울특별시',
  })
  eventLocation: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty({
    example: '재밌게 놀아요',
  })
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '산책',
  })
  category: string;

  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  isDeleted: boolean = false;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, default: '🙋‍♀️아무나' })
  isVerified?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, default: null })
  eventImg?: string;
}
