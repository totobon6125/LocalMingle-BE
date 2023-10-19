import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // 1. 이벤트 생성
  async create(userId: number, createEventDto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: createEventDto,
    });

    const category = await this.prisma.category.create({
      data: {
        EventId: event.eventId,
        name: event.category,
      },
    });

    const hostEvent = await this.prisma.hostEvent.create({
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

  async createViewLog(eventId: number) {
    await this.prisma.viewlog.create({
      data: {
        EventId: eventId,
        UserId: 1,
      },
    });
  }

  async isJoin(eventId: number, userId: number) {
    const isJoin = await this.prisma.guestEvent.findFirst({
      where: {
        EventId: eventId,
        GuestId: userId,
      },
    });
    return isJoin;
  }

  async join(eventId: number, userId: number) {
    await this.prisma.guestEvent.create({
      data: {
        EventId: eventId,
        GuestId: userId,
      },
    });
  }

  async cancelJoin(guestEventId: number) {
    await this.prisma.guestEvent.delete({
      where: { guestEventId },
    });
  }

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

  update(eventId: number, updateEventDto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { eventId },
      data: updateEventDto,
    });
  }

  remove(eventId: number) {
    return this.prisma.event.update({
      where: { eventId },
      data: {
        isDeleted: true,
      },
    });
  }

  // 북마크 추가
  async addBookmark(eventId: number, userId: number, status: string) {
    return await this.prisma.eventBookmark.create({
      data: {
        EventId: eventId,
        UserId: userId,
        status: status,
        updatedAt: new Date(),
      },
    });
  }

  // 북마크 제거
  async removeBookmark(eventId: number, userId: number, status: string) {
    // 먼저 eventBookmarkId를 찾습니다.
    const eventBookmark = await this.prisma.eventBookmark.findFirst({
      where: {
        EventId: eventId,
        UserId: userId,
      },
    });

    if (!eventBookmark) {
      throw new NotFoundException('해당 북마크를 찾을 수 없습니다.');
    }

    // 찾은 eventBookmarkId를 통해 deletedAt을 업데이트 합니다.
    return await this.prisma.eventBookmark.update({
      where: { eventBookmarkId: eventBookmark.eventBookmarkId },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });
  }
}
