import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [DataController],
  providers: [DataService],
  imports: [PrismaModule]
})
export class DataModule {}
