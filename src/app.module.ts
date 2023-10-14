import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mails/mail.module';
import { ConfigModule } from '@nestjs/config';
import { DataModule } from './data/data.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true,}), PrismaModule, UsersModule, AuthModule, EventsModule, MailModule, DataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
