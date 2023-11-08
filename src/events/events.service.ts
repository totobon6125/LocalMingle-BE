import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class EventsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService
  ) {}

  // 1. 이벤트 생성
  async create(userId: number, createEventDto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: createEventDto,
    });

    // 카테고리 테이블 생성
    await this.prisma.category.create({
      data: {
        EventId: event.eventId,
        name: event.category,
      },
    });

    // 호스트 이벤트 테이블(호스트유저와 이벤트를 맵핑해주는 테이블) 생성
    await this.prisma.hostEvent.create({
      data: {
        HostId: userId,
        EventId: event.eventId,
      },
    });
    return event;
  }

  // 2. 이벤트 전체 조회
  async findAll(page: number) {
    const cachedEvents: any = await this.cacheManager.get('events');
    const cachedData = cachedEvents ? JSON.parse(cachedEvents) : null;
    if (cachedData) {
      return cachedData;
    } else {
      const events = await this.prisma.event.findMany({
        take: 4,
        skip: page, 
        // ...(lastPage && { cursor: { eventId: lastPage } }),
        where: {
          isDeleted: false,
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
      await this.cacheManager.set('events', JSON.stringify(events));
      return events;
    }
  }

  // 3. 이벤트 상세 조회
  async findOne(eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: { eventId, isDeleted: false },
      include: {
        HostEvents: {
          select: {
            HostId: true,
            User: {
              select: {
                UserDetail: true,
              },
            },
          },
        },
        GuestEvents: {
          select: {
            GuestId: true,
            User: {
              select: {
                UserDetail: true,
              },
            },
          },
        },
        _count: {
          select: {
            Viewlogs: true,
          },
        },
      },
    });
    if (!event) {
      throw new NotFoundException(`${eventId}번 이벤트가 없습니다`);
    }

    return event;
  }

  // 3-1. 이벤트 조회수 로거
  async createViewLog(eventId: number, userId: number) {
    await this.prisma.viewlog.create({
      data: {
        EventId: eventId,
        UserId: userId,
      },
    });
  }

  // 4-1. 이벤트 참가여부 확인
  async isJoin(eventId: number, userId: number) {
    const isJoin = await this.prisma.guestEvent.findFirst({
      where: {
        EventId: eventId,
        GuestId: userId,
      },
    });
    return isJoin;
  }

  // 4. 이벤트 참가 신청
  async join(eventId: number, userId: number) {
    await this.prisma.guestEvent.create({
      data: {
        EventId: eventId,
        GuestId: userId,
      },
    });
  }

  // 4-2. 이벤트 참가 취소
  async cancelJoin(guestEventId: number) {
    await this.prisma.guestEvent.delete({
      where: { guestEventId },
    });
  }

  // 4-3. 이벤트 참가 신청/취소 로그
  async createRsvpLog(eventId: number, userId: number, status: string) {
    await this.prisma.rsvpLog.create({
      data: {
        EventId: eventId,
        UserId: userId,
        status: status,
        createdAt: new Date(),
      },
    });
  }

  // 5. 이벤트 수정
  async update(eventId: number, updateEventDto: UpdateEventDto) {
    await this.prisma.event.update({
      where: { eventId },
      data: updateEventDto,
    });
  }

  // 5-1. 이벤트 이미지 수정
  async updateImg(eventId: number, updatedImg: string) {
    const ImgUrl = await this.prisma.event.update({
      where: { eventId },
      data: { eventImg: updatedImg },
    });
    return ImgUrl;
  }

  // 6. 이벤트 삭제
  async remove(eventId: number) {
    return await this.prisma.event.update({
      where: { eventId },
      data: {
        isDeleted: true,
      },
    });
  }

  // 7-1. 관심있는 북마크 추가
  async addBookmark(eventId: number, userId: number, status: string) {
    const lastEventInTable = await this.prisma.eventBookmark.findFirst({
      where: {
        EventId: eventId,
        UserId: userId,
      },
      orderBy: {
        eventBookmarkId: 'desc',
      },
    });

    // 이벤트의 북마크가 존재하지 않거나 가장 최신의 북마크 status가 unbookmarked이면 새로운 로그를 생성한다.
    if (!lastEventInTable || lastEventInTable.status === 'unbookmarked') {
      return await this.prisma.eventBookmark.create({
        data: {
          EventId: eventId,
          UserId: userId,
          status: status,
          updatedAt: new Date(),
        },
      });
    }
    // 이미 북마크가 있으면 이미 존재하는 북마크라고 안내를 보낸다.
    else {
      throw new BadRequestException(
        '이미 북마크한 이벤트는 다시 북마크 할 수 없습니다.'
      );
    }
  }

  // 7-2. 관심있는 이벤트 북마크 제거
  async removeBookmark(eventId: number, userId: number, status: string) {
    const lastEventInTable = await this.prisma.eventBookmark.findFirst({
      where: {
        EventId: eventId,
        UserId: userId,
      },
      orderBy: {
        eventBookmarkId: 'desc',
      },
    });

    // console.log('removeBookmark:', lastEventInTable);
    if (!lastEventInTable) {
      throw new NotFoundException('해당 북마크를 찾을 수 없습니다.');
    }

    if (lastEventInTable.status === 'bookmarked') {
      // 마지막 북마크가 bookmarked면 북마크 unbookmarked 로그를 생성한다.
      return await this.prisma.eventBookmark.create({
        data: {
          EventId: eventId,
          UserId: userId,
          status: status,
          updatedAt: new Date(),
        },
      });
    } else {
      // 마지막 북마크가 unbookmarked면 이미 취소한 북마크라고 안내를 보낸다.
      throw new BadRequestException('이미 북마크를 취소한 이벤트입니다.');
    }
  }
}
