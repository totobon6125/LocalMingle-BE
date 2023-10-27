import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchesService {
  constructor(private readonly prisma: PrismaService) {}

  async searchByNameOrContent(query: string) {
    if (query.length < 2) {
      throw new BadRequestException('검색어를 2글자 이상 입력해주세요')
    }
    const events = await this.prisma.event.findMany({
      where: {
        isDeleted: false,
        OR: [
          { eventName: { contains: query } },
          { content: { contains: query } },
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
    return events;
  }

  searchByLocation(query: any) {
    return this.prisma.event.findMany({
      where: { location_City: query.doName, isDeleted: false },
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

  searchByCategory(query:string) {
    return this.prisma.event.findMany({
      where: { category: query, isDeleted: false },
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

  searchByVerify(query:string) {
    return this.prisma.event.findMany({
      where: { isVerified: query, isDeleted: false },
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
