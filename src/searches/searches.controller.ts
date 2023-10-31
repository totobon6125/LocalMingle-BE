import { Controller, Get, Injectable, Query } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchesDto } from './searches.dto.ts/searches.dto';

@Controller('search')
@Injectable()
@ApiTags('Search')
export class SearchesController {
  constructor(private readonly searchesService: SearchesService) {}

  @Get()
  @ApiOperation({ summary: '이벤트네임 or 콘텐츠 검색' })
  async searchByLocation(@Query() searchesDto: SearchesDto) {
    console.log(searchesDto.keyWord)
    const events = await this.searchesService.search(searchesDto);

    const event = events.map((item) => {
      const { GuestEvents, HostEvents, ...rest } = item;
      const hostUser = HostEvents[0].User.UserDetail;

      return {
        event: rest,
        guestList: GuestEvents.length,
        hostUser: hostUser,
      };
    });
    return event;
  } }
