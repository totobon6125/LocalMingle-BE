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
    console.log("event", event)
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
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
