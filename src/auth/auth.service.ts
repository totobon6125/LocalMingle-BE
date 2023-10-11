import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  IAuthServiceGetAccessToken,
  IAuthServiceGetRefereshToken,
  IAuthServiceLogin,
} from './interface/auth-service.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login({ email, password }: IAuthServiceLogin): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // 1. 이메일이 일치하는 유저를 DB에서 찾기
    const user = await this.usersService.findByEmail({ email });

    // 2. 일치하는 유저가 없으면 에러
    if (!user) throw new NotFoundException('이메일이 없습니다.');

    // 3. 일치하는 유저는 있지만 비밀번호가 틀렸다면 에러
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth)
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    // 4. 리프레시 토큰 생성
    const refreshToken = this.generateRefreshToken({ user });

    // 5. 액세스 토큰 및 리프레시 토큰을 반환
    const accessToken = await this.getAccessToken({ user });

    return { accessToken, refreshToken };
  }

  async getAccessToken({ user }: IAuthServiceGetAccessToken): Promise<string> {
    const accessToken = this.jwtService.sign(
      { sub: user.userId },
      { secret: process.env.JWT_ACCESS_KEY, expiresIn: '60s' },
    );

    return accessToken;
  }

  generateRefreshToken({ user }: IAuthServiceGetRefereshToken): string {
    // 리프레시 토큰을 생성하는 로직을 구현
    const refreshToken = this.jwtService.sign(
      { sub: user.userId },
      { secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
    );
    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    // 리프레시 토큰의 유효성을 검증
    const decodedToken = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_KEY,
    });

    // 리프레시 토큰이 유효하다면 새로운 액세스 토큰을 발급
    const newAccessToken = await this.getAccessToken({ user: decodedToken });

    return newAccessToken;
  }
}
