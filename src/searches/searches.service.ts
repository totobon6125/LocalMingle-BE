import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchesService {
  constructor(private readonly prisma: PrismaService) {}

  async searchEvents(
    query: string
  ): Promise<{ eventName: string; content: string }[]> {
    const events = await this.prisma.event.findMany({
      where: {
        OR: [
          { eventName: { contains: query } },
          { content: { contains: query } },
        ],
      },
      select: {
        eventName: true,
        content: true,
      },
    });

    return events;
  }
}
