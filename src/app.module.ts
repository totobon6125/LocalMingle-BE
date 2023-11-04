import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mails/mail.module';
import { ConfigModule } from '@nestjs/config';
import { DataModule } from './data/data.module';
import { SearchesModule } from './searches/searches.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsModule } from './chats/chats.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    ChatsModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    EventsModule,
    MailModule,
    DataModule,
    SearchesModule,
    RedisModule.forRoot({
      readyLog: true,
      config: {
        host: process.env.REDID_HOST,
        port: 6379,
        password: process.env.REDIS_PASS
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
