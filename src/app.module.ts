import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mails/mail.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, EventsModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
