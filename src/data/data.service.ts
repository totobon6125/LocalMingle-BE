import { Injectable } from '@nestjs/common';
import { Verify } from 'src/data/interface/verify';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DataService {
  constructor(private prisma: PrismaService) {}

  cityData() {
    return this.prisma.region.findMany({
      select: { doName: true },
    });
  }

  async guNameData(query) {
    const data = await this.prisma.region.findMany({
      where: { doName: query.doName },
      select: { guName: true },
    });
    return data;
  }

  filteredEventByCity(query) {
    return this.prisma.event.findMany({
      where: { eventLocation: query.doName },
      select: {isDeleted: false}
    });
  }

  filteredEventByVerify(query: Verify) {
    return this.prisma.event.findMany({
      where: { isVerified: query.verify },
    });
  }
}
