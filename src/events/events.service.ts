import { BadRequestException, Injectable } from '@nestjs/common';
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
  uploadFile (file: Express.Multer.File) {
    if (!file) throw new BadRequestException()
    return file.path
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


}
