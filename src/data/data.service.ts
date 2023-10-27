import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DataService {
  constructor(private prisma: PrismaService) {}

  async guNameData(query) {
    const data = await this.prisma.region.findMany({
      where: { doName: query.doName },
      select: { guName: true },
    });
    return data;
  }
}
