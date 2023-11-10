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
import { CacheModule } from '@nestjs/cache-manager';

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
    CacheModule.register({
      isGlobal:true,
      til: 60,
      max: 100
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
