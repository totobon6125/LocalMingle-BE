// src/users/users.service.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AwsModule } from 'src/aws/aws.module';
import { AwsS3Service } from 'src/aws/aws.s3';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AwsS3Service],
  imports: [PrismaModule, AwsModule],
  exports: [UsersService],
})
export class UsersModule {}
