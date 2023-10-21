import { JwtNaverStrategy } from './strategies/jwt-social-naver.strategy';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { UsersService } from 'src/users/users.service';
import { JwtKakaoStrategy } from './strategies/jwt-social-kakao.strategy';
import { JwtGoogleStrategy } from './strategies/jwt-social-google.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

export const jwtSecret = process.env.JWT_SECRET;
@Module({
  imports: [PrismaModule, PassportModule, UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthService,
    UsersService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtKakaoStrategy,
    JwtNaverStrategy,
    JwtGoogleStrategy,
  ],
})
export class AuthModule {}
