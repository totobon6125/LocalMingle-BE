import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchesDto } from './searches.dto.ts/searches.dto';

@Injectable()
export class SearchesService {
  constructor(private readonly prisma: PrismaService) {}

  search(searchesDto: SearchesDto) {
    return this.prisma.event.findMany({
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
            : null,
          {
            isVerified:
              searchesDto.verify == ''
                ? { not: null }
                : { contains: searchesDto.verify },
          },
          {
            location_City:
              searchesDto.city == ''
                ? { not: null }
                : { contains: searchesDto.city },
          },
          {
            location_District:
              searchesDto.guName == ''
                ? { not: null }
                : { contains: searchesDto.guName },
          },
          {
            category:
              searchesDto.category == ''
                ? { not: null }
                : { contains: searchesDto.category },
          },
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
  }
}
