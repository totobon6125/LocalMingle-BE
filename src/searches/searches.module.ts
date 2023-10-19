import { Module } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [SearchesService],
  exports: [SearchesService],
})
export class SearchesModule {}

// /search?query=특정 단어 와 같은 URL로 접근
