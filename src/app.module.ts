import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { DataModule } from './data/data.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, EventsModule, DataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
