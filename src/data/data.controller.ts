import { Controller, Get, Query} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataService } from './data.service';
import { City } from 'src/interface/city';

@Controller('data')
@ApiTags('Data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('city')
  @ApiOperation({summary: '시/도 데이터목록'})
  async cityData() {
    const region = await this.dataService.cityData()
    
    const city = region.filter((item, index) => {
      return region.findIndex((x) => x.doName === item.doName) === index;
    });

    return city
  }

  @Get('gu_name')
  @ApiOperation({summary: '구/군 데이터 목록'})
  @ApiQuery({name: 'doName', type: String, required: true})
  async guNameData(@Query() query: City) {
    return await this.dataService.guNameData(query)
  }
}
