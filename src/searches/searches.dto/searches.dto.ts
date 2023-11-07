import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchesDto {
  @ApiProperty({
    example: '🏡동네만, 🙋‍♀️아무나',
    required: false,
  })
  @IsOptional()
  @IsString()
  verify: string;

  @ApiProperty({
    example: '☕맛집/커피, 🏃‍♂️운동/건강,🐾애완동물, 📕공부/교육',
    required: false,
  })
  @IsOptional()
  @IsString()
  category: string;

  @ApiProperty({
    example: '서울특별시, 경기도 등',
    required: false,
  })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({
    example: '종로구, 수원시 등',
    required: false,
  })
  @IsOptional()
  @IsString()
  guName: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  keyWord: string;
}
