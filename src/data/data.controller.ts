import { Controller, Get, Query} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { DataService } from './data.service';
import { City } from 'src/interface/city';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('city')
  @ApiOperation({summary: '이벤트 시/도 데이터목록'})
  async cityData() {
    const region = await this.dataService.cityData()
    
    const city = region.filter((item, index) => {
      return region.findIndex((x) => x.doName === item.doName) === index;
    });

    return city
  }

  @Get('gu_name')
  @ApiOperation({summary: '이벤트 구/군 데이터 목록'})
  async guNameData(@Query() query: City) {
    const guName = await this.dataService.guNameData(query)
    return guName
  }
}
