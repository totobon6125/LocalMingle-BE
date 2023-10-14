import { Injectable } from '@nestjs/common';
import { Category } from 'src/interface/category';
import { City } from 'src/interface/city';
import { Verify } from 'src/interface/verify';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DataService {
  constructor(private prisma: PrismaService) {}

  cityData() {
    return this.prisma.region.findMany({
      select: { doName: true },
    });
  }

  async guNameData(query: City) {
    const data = await this.prisma.region.findMany({
      where: { doName: query.doName },
      select: { guName: true },
    });
    return data;
  }

  filteredEventByCity(query: City) {
    return this.prisma.event.findMany({
      where: { eventLocation: query.doName },
    });
  }

  filteredEventByCategory(query: Category) {
    return this.prisma.event.findMany({
      where: { category: query.category },
    });
  }

  filteredEventByVerify(query: Verify) {
    return this.prisma.event.findMany({
      where: { isVerified: query.verify },
    });
  }
}
