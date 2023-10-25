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
  @ApiOperation({
    summary: 'API 호출시 query 값(언어: ko, en, jp)에 따라 시/도 데이터를 반환',
  })
  @ApiQuery({ name: 'lang', type: String, required: true })
  async cityData(@Query() query: any) {
    console.log(query.lang);
    if (query.lang !== 'ko' && query.lang !== 'jp' && query.lang !== 'en') {
      return { message: '[ko, en, jp] 중 하나를 입력하세요' };
    }
    
    const langByCity = city.find((item) => {
      return item.lang == query.lang;
    });
    return langByCity;
  }

  @Get('gu_name')
  @ApiOperation({ summary: 'API 호출시 도, 시를 query 값으로 받아서 하위 구, 군 목록 반환' })
  @ApiQuery({ name: 'doName', type: String, required: true })
  async guNameData(@Query() query) {
    return await this.dataService.guNameData(query);
  }

  @Get('toss')
  @ApiOperation({ summary: 'API 호출시 카테고리 목록, 아무나, 위치 인증 여부를 반환' })
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
