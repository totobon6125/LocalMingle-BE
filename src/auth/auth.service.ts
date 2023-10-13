import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthServiceLogin } from './interface/auth-service.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login({ email, password, res }): Promise<{
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
    const refreshToken = this.setRefreshToken({ user, res });

    // 5. 액세스 토큰 및 리프레시 토큰을 반환
    const accessToken = await this.getAccessToken({ user, res });

    return { accessToken, refreshToken };
  }

  async getAccessToken({ user, res }): Promise<string> {
    const accessToken = this.jwtService.sign(
      { sub: user.userId },
      { secret: process.env.JWT_ACCESS_KEY, expiresIn: '60s' },
    );

    return accessToken;
  }

  setRefreshToken({ user, res }): string {
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
    const newAccessToken = await this.getAccessToken({
      user: decodedToken,
      res: null,
    });

    return newAccessToken;
  }

  async OAuthLogin({ req, res }) {
    // 1. 회원조회
    let user = await this.usersService.findByEmail({ email: req.user.email }); //user를 찾아서

    if (!user) {
      // 이 부분에서 아이디 생성과 관련된 코드를 추가해야 합니다.
      const createUser = {
        email: req.user.email, // 사용자의 이메일을 사용하여 아이디 생성
        nickname: req.user.name,
        password: req.user.password, // 비밀번호를 해싱하여 저장
        confirmPassword: req.user.password, // 비밀번호를 해싱하여 저장
        intro: req.user.intro,
        profileImg: req.user.profileImg,
        // 다른 필드도 설정해야 할 수 있음
      };
      console.log('소셜로그인회원가입 : ', createUser); // createUser 정보를 콘솔에 출력
      user = await this.usersService.create(createUser);
    }

    // 3. 회원가입이 되어있다면? 로그인(AT, RT를 생성해서 브라우저에 전송)한다
    this.getAccessToken({ user, res }); // res를 전달
    this.setRefreshToken({ user, res }); // res를 전달
    //리다이렉션
    res.redirect('http://127.0.0.1:5500');
  }
}
