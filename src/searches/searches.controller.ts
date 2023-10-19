import { Controller, Get, Injectable, Query } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('search')
@Injectable()
@ApiTags('Search')
export class SearchesController {
  constructor(private readonly searchesService: SearchesService) {}

  @Get()
  @ApiOperation({ summary: '이벤트네임 or 콘텐츠 검색' })
  async search(
    @Query('query') query: string // @Query 데코레이터 추가
  ): Promise<{ eventName: string; content: string }[]> {
    return this.searchesService.searchEvents(query);
  }
}
