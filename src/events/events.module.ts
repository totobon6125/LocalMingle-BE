import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer/multer.config';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [PrismaModule, MulterModule.registerAsync({
    useClass: MulterConfigService
  })],
})
export class EventsModule {}
