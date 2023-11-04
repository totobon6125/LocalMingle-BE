import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchesDto } from './searches.dto/searches.dto';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class SearchesService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService
  ) {}

  async search(searchesDto: SearchesDto) {
    const redisEvents = await this.redis.get('search');
    const cachedEvents = redisEvents ? JSON.parse(redisEvents) : null;
    if (cachedEvents) {
      return cachedEvents;
    } else {
      const searchedEvents = await this.prisma.event.findMany({
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
      await this.redis.set('search', JSON.stringify(searchedEvents));
      return searchedEvents;
    }
  }
}
