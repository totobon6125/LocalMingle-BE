import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchesDto } from './searches.dto/searches.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SearchesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService
  ) {}

  async search(searchesDto: SearchesDto) {
    const searchedEvents: any = await this.cacheManager.get('searchedEvents');
    const cachedData = searchedEvents ? searchedEvents : null;
    if (cachedData) {
      return cachedData;
    } else {
      const events = await this.prisma.event.findMany({
        where: {
          isDeleted: false,
          AND: [
            searchesDto.keyWord
              ? {
                  OR: [
                    { eventName: { contains: searchesDto.keyWord } },
                    { content: { contains: searchesDto.keyWord } },
                  ],
                }
              : {},
            searchesDto.verify
              ? { isVerified: { contains: searchesDto.verify } }
              : {},
            searchesDto.city
              ? { location_City: { contains: searchesDto.city } }
              : {},
            searchesDto.guName
              ? { location_District: { contains: searchesDto.guName } }
              : {},
            searchesDto.category
              ? { category: { contains: searchesDto.category } }
              : {},
          ],
        },
        include: {
          HostEvents: {
            select: {
              User: {
                select: {
                  UserDetail: true,
                },
              },
            },
          },
          GuestEvents: true,
          _count: {
            select: {
              Viewlogs: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      await this.cacheManager.set('searchedEvents', events);
      return events;
    }
  }
}
