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
  async searchByNameOrContent(@Query('query') query: string) {
    const events = await this.searchesService.searchByNameOrContent(query);

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
  }

  @Get('byLocation')
  @ApiQuery({ name: 'doName', type: String, example: '서울특별시, 경기도 등등'})
  async searchByLocation(@Query() query:any) {
    const events = await this.searchesService.searchByLocation(query);

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
  }

  @Get('byCategory')
  @ApiOperation({ summary: '카테고리별 검색' })
  @ApiQuery({ name: 'query', type: String, example:'☕맛집/커피, 🏃‍♂️운동/건강,🐾애완동물, 📕공부/교육' })
  async searchByCategory(@Query('query') query: string) {
    const events = await this.searchesService.searchByCategory(query);

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
  }

  @Get('byVerify')
  @ApiOperation({ summary: '🏡동네만 or 🙋‍♀️아무나 검색' })
  @ApiQuery({ name: 'query', type: String, example: '🏡동네만, 🙋‍♀️아무나' })
  async searchByVerify(@Query('query') query: string) {
    const events = await this.searchesService.searchByVerify(query);

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
  }
}
