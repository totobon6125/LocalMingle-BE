import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

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

    // const guestEvent = await this.prisma.guestEvent.create({
    //   data: {
    //     EventId: event.eventId,
    //   },
    // });
    console.log('create in events.service:', event);
    console.log(category);
    console.log(hostEvent);
    // console.log(guestEvent);
    return event;
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

  /* TODO: 참가 취소하면 guestEvent에서 지우는게 아니라 guestEvent의 isDeleted를 true로 바꾸는 방식으로 변경 */
  async cancelJoin(guestEventId: number) {
    await this.prisma.guestEvent.delete({
      where: { guestEventId },
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
