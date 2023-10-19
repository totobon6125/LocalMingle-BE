import { Controller, Get, Injectable } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('search')
@Injectable()
@ApiTags('Searches')
export class SearchesController {
  constructor(private readonly searchService: SearchesService) {}

  @Get()
  @ApiOperation({ summary: '회원 조회' })
  async search(
    query: string
  ): Promise<{ eventName: string; content: string }[]> {
    return this.searchService.searchEvents(query);
  }
}
