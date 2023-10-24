import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataService } from './data.service';
import { Verify, toss } from './interface/verify';
import { city } from './interface/city';

@Controller('data')
@ApiTags('Data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('city')
  @ApiOperation({ summary: '시/도 데이터목록' })
  @ApiQuery({ name: 'lang', type: String, required: true })
  async cityData(@Query() query) {
    const langByCity = city.find((item) => {
      return item.lang == query.lang
    });

    return langByCity;
  }

  @Get('gu_name')
  @ApiOperation({ summary: '구/군 데이터 목록' })
  @ApiQuery({ name: 'doName', type: String, required: true })
  async guNameData(@Query() query) {
    return await this.dataService.guNameData(query);
  }

  @Get('toss')
  @ApiOperation({ summary: '카테고리, 위치인증 여부 목록' })
  categoryData() {
    const data = toss;
    return data;
  }

  @Get('filter/city')
  @ApiOperation({ summary: '이벤트 필터링(시/도)' })
  @ApiQuery({ name: 'doName', type: String, required: true })
  filteredEventByCity(@Query() query) {
    return this.dataService.filteredEventByCity(query);
  }

  @Get('filter/verify')
  @ApiOperation({ summary: '이벤트 필터링(위치인증)' })
  @ApiQuery({ name: 'verify', type: String, required: true })
  filteredEventByVerify(@Query() query: Verify) {
    return this.dataService.filteredEventByVerify(query);
  }
}
