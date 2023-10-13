import { Injectable } from '@nestjs/common';
import { City } from 'src/interface/city';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DataService {
  constructor(private prisma: PrismaService) {}
  async cityData() {
    const doName = await this.prisma.region.findMany({
      select: {
        doName: true,
      },
    });
    return doName;
  }

  async guNameData(query: City) {
    const guName = await this.prisma.region.findMany({
      where: {doName: query.doName},
      select: {guName: true},
    });
    return guName;
  }
}