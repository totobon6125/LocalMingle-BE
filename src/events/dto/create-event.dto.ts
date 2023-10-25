import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDate,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  Min,
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

  @ApiProperty({
    example: '서울특별시',
  })
  @IsString()
  @IsNotEmpty()
  eventLocation: string;

  @ApiProperty({
    example: '재밌게 놀아요',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  content: string;

  @ApiProperty({
    example: '산책',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  isDeleted: boolean = false;

  @ApiProperty({ required: false, default: '🙋‍♀️아무나' })
  @IsOptional()
  @IsString()
  isVerified?: string;

  @ApiProperty({ required: false, default: null })
  @IsOptional()
  @IsString()
  eventImg: string;
}
