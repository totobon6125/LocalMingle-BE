import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer/multer.config';
import { AwsS3Service } from 'src/aws/aws.s3';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService, AwsS3Service],
  imports: [PrismaModule, AwsModule],
})
export class EventsModule {}
