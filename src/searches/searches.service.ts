import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchesService {
  constructor(private readonly prisma: PrismaService) {}

  async searchByNameOrContent(
    query: string
  ): Promise<{ eventName: string; content: string }[]> {
    // 최소 2글자 이상의 검색어 확인
    if (query.length < 2) {
      throw new BadRequestException('검색어는 최소 2글자 이상이어야 합니다.');
    }
    const events = await this.prisma.event.findMany({
      where: {
        isDeleted: false,
        OR: [
          { eventName: { contains: query } },
          { content: { contains: query } },
        ],
      },
    });
    return events;
  }

  searchByLocation(query: any) {
    return this.prisma.event.findMany({
      where: { eventLocation: query.doName, isDeleted: false },
    });
  }

  searchByCategory(query: string) {
    return this.prisma.event.findMany({
      where: { category: query, isDeleted: false },
    });
  }

  searchByVerify(query: string) {
    return this.prisma.event.findMany({
      where: { isVerified: query, isDeleted: false },
    });
  }
}
