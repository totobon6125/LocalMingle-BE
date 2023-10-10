import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: createEventDto,
    });
    console.log('event', event);
    await this.prisma.category.create({
      data: {
        EventId: event.eventId,
        name: event.category,
      },
    });

    await this.prisma.hostEvent.create({
      data: {
        HostId: 1,
        EventId: event.eventId,
      },
    });

    await this.prisma.guestEvent.create({
      data: {
        EventId: event.eventId,
      },
    });

    return event;
  }

  findAll() {
    return this.prisma.event.findMany({
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
      where: { eventId },
      include: {
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
        _count : {
          select : {
            Viewlogs : true
          }
        }
      },
    });

    return event
  }

 async createViewLog(eventId: number) {
    await this.prisma.viewlog.create({
      data: {
        EventId: eventId,
        UserId: 1
      }
    })
  }

  async isJoin(eventId:number, userId: number) {
    const isJoin = await this.prisma.guestEvent.findFirst({
      where: {
        EventId: eventId,
        GuestId: 3
      }
    })
    return isJoin
  }

  async join(eventId: number, userId: number) {
    await this.prisma.guestEvent.create({
      data: {
        EventId: eventId,
        GuestId: 3,
      },
    });
  }

  async cancleJoin(guestEventId: number) {
    await this.prisma.guestEvent.delete({
      where: { guestEventId },
    });
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
