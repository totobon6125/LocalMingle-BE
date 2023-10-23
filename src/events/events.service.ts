import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // 1. 이벤트 생성
  async create(userId: number, createEventDto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: createEventDto,
    });

    await this.prisma.category.create({
      data: {
        EventId: event.eventId,
        name: event.category,
      },
    });

    await this.prisma.hostEvent.create({
      data: {
        HostId: userId,
        EventId: event.eventId,
      },
    });
    return event;
  }

  // 이벤트 이미지 업로드
  uploadFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException();
    return file.path;
  }

  // 이벤트 전체 조회
  findAll() {
    return this.prisma.event.findMany({
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
  }

  // 이벤트 상세 조회
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

    return event;
  }

  // 이벤트 조회 로그
  async createViewLog(eventId: number) {
    await this.prisma.viewlog.create({
      data: {
        EventId: eventId,
        UserId: 1,
      },
    });
  }

  // 이벤트 참가여부 확인
  async isJoin(eventId: number, userId: number) {
    const isJoin = await this.prisma.guestEvent.findFirst({
      where: {
        EventId: eventId,
        GuestId: userId,
      },
    });
    return isJoin;
  }

  // 이벤트 참가 신청
  async join(eventId: number, userId: number) {
    await this.prisma.guestEvent.create({
      data: {
        EventId: eventId,
        GuestId: userId,
      },
    });
  }

  // 이벤트 참가 취소
  async cancelJoin(guestEventId: number) {
    await this.prisma.guestEvent.delete({
      where: { guestEventId },
    });
  }

  // 이벤트 신청/취소 로그
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

  // 이벤트 수정
  update(eventId: number, updateEventDto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { eventId },
      data: updateEventDto,
    });
  }

  // 이벤트 삭제
  remove(eventId: number) {
    return this.prisma.event.update({
      where: { eventId },
      data: {
        isDeleted: true,
      },
    });
  }

  // 관심있는 북마크 추가
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
    console.log('addBookmark:', lastEventInTable);

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
      throw new BadRequestException('이미 북마크한 이벤트는 다시 북마크 할 수 없습니다.');
    }
  }

  // 관심있는 이벤트 북마크 제거
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

    console.log('removeBookmark:', lastEventInTable);
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
