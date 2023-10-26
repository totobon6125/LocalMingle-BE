import { Controller, Get, Injectable, Query } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('search')
@Injectable()
@ApiTags('Search')
export class SearchesController {
  constructor(private readonly searchesService: SearchesService) {}

  @Get()
  @ApiOperation({ summary: '이벤트네임 or 콘텐츠 검색' })
  async searchByNameOrContent(
    @Query('query') query: string // @Query 데코레이터 추가
  ): Promise<{ eventName: string; content: string }[]> {
    return this.searchesService.searchByNameOrContent(query);
  }

  @Get('byLocation')
  @ApiOperation({ summary: '이벤트 장소별 검색' })
  @ApiQuery({ name: 'doName', type: String, required: true })
  searchByLocation(@Query() query:any) {
    return this.searchesService.searchByLocation(query);
  }

  @Get('byCategory')
  @ApiOperation({ summary: '카테고리별 검색' })
  searchByCategory(@Query('query') query: string) {
    console.log(query)
    return this.searchesService.searchByCategory(query);
  }

  @Get('byVerify')
  @ApiOperation({ summary: '동네만 or 아무나 검색' })
  searchByVerify(@Query('query') query: string) {
    console.log(query)
    return this.searchesService.searchByVerify(query);
  }
}
