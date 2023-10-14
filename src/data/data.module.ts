import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DataController } from './data.controller';

@Module({
  controllers: [DataController],
  providers: [DataService],
  imports: [PrismaModule]
})
export class DataModule {}
