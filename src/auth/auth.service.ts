import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
//import { IAuthServiceLogin } from './interface/auth-service.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login({ email, password, res }): Promise<{
    // 리팩토링 시 res 빼도 작동하는지 테스트
    accessToken: string;
    refreshToken: string;

    //user: User; // User 정보를 반환하기 위한 타입
    userId: number; // userId만 반환
  }> {
    // 1. 이메일이 일치하는 유저를 DB에서 찾기
    const user = await this.usersService.findByEmail({ email });
    console.log(user);
    // 2. 일치하는 유저가 없으면 에러
    if (!user) throw new NotFoundException('이메일이 없습니다.');

    // 2-1. 사용자가 삭제되지 않았는지 확인 (deletedAt가 null이어야 함)
    if (user.deletedAt !== null) {
      throw new UnauthorizedException('사용자가 삭제되었습니다.');
    }

    // 3. 일치하는 유저는 있지만 비밀번호가 틀렸다면 에러
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth)
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    // const isdeletedAt
    // 4. 리프레시 토큰 생성
    const refreshToken = this.setRefreshToken({ user, res });

    // 5. 액세스 토큰 및 리프레시 토큰을 반환
    const accessToken = this.getAccessToken({ user, res });

    // 6. DB에 리프레시 토큰을 저장한다.
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        refreshToken: refreshToken,
      },
    });

    //Authorization로 보내도록 결정되면 이렇게 수정(피드백 받으면 좋을 내용)
    // res.header('Authorization', `Bearer ${accessToken}`);
    // res.header('RefreshToken', refreshToken);

    //TODO : user값 대신 userId값만 넘어가게 수정해야함 ()
    return { accessToken, refreshToken, userId: user.userId }; //리턴값
  }

  getAccessToken({ user, res }): string {
    const accessToken = this.jwtService.sign(
      { sub: user.userId },
      { secret: process.env.JWT_ACCESS_KEY, expiresIn: '36000s' }
    );
    //res.cookie('accessToken', accessToken);
    // res.header('accessToken', accessToken); // 클라이언트로 액세스 토큰을 반환
    //res.header('Authorization', `Bearer ${accessToken}`); // 클라이언트로 액세스토큰을 Authorization 에 Bearer 로 반환
    //console.log('엑세스 토큰 확인용 로그', user);
    return accessToken;
    // return res.header(accessToken);
  }

  setRefreshToken({ user, res }): string {
    // 리프레시 토큰을 생성하는 로직을 구현
    const refreshToken = this.jwtService.sign(
      { sub: user.userId },
      { secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' }
    );
    //res.cookie('refreshToken', refreshToken);
    // res.header('refreshToken', refreshToken); // 클라이언트로 리프레시 토큰을 반환
    //console.log('리프레시 토큰 확인용 로그', user);
    return refreshToken;
    // return res.header(refreshToken);
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

  async OAuthLogin({ req, res }): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: number;
  }> {
    // 1. 회원조회
    let user = await this.usersService.findByEmail({ email: req.user.email }); // user를 찾아서

    if (!user) {
      // 아이디 생성 관련 코드 추가
      const createUser = {
        email: req.user.email, // 사용자의 이메일을 사용하여 아이디 생성
        nickname: req.user.nickname, //닉네임 익명 닉네임 생성 로직
        password: req.user.password, // 비밀번호를 해싱하여 저장
        confirmPassword: req.user.password, // 비밀번호를 해싱하여 저장
        intro: req.user.intro,
        profileImg: req.user.profileImg,
        // 다른 필드도 설정해야 할 수 있음
      };
      // console.log('소셜 로그인 회원가입 : ', createUser); // createUser 정보를 콘솔에 출력
      user = await this.usersService.create(createUser);
    }

    // 3. 회원가입이 되어 있다면? 로그인(AT, RT를 생성해서 브라우저에 전송)한다
    const accessToken = this.getAccessToken({ user, res }); // res를 전달
    const refreshToken = this.setRefreshToken({ user, res }); // res를 전달
    // 4. 로그인이 되면 DB에 리프레시 토큰을 저장한다.
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        refreshToken: refreshToken,
      },
    });

    //Authorization로 보내도록 결정되면 이렇게 수정(피드백 받으면 좋을 내용)
    // res.header('Authorization', `Bearer ${accessToken}`);
    // res.header('RefreshToken', refreshToken);

    // res.header('accessToken', accessToken);
    // res.header('refreshToken', refreshToken);
    res.header('userId', user.userId);

    res.cookie('accessToken', accessToken, {
      httpOnly: false, // 배포시에 true
      sameSite: 'none',
      secure: false, // 배포시에 true
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: false, // 배포시에 true
      sameSite: 'none',
      secure: false, // 배포시에 true
    });

    // res.cookie('accessToken', token, {
    //   httpOnly: false,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 1000 * 60 * 60,
    // });

    console.log('로컬 엑세스 토큰', accessToken);
    console.log('로컬 리프레시 토큰', refreshToken);
    console.log(user.userId);

    // 리다이렉션
    res.redirect(
      `http://localhost:5500?accessToken=${encodeURIComponent(
        accessToken
      )}&refreshToken=${encodeURIComponent(
        refreshToken
      )}&userId=${encodeURIComponent(user.userId)}`
    );
    // 메인페이지뒤에 ? 해서 userId를 보내야한다.
    // `http://localhost:5500?userId=${user.userId}`
    //https://www.totobon6125.store/
    // https://www.totobon6125.store?userId=${user.userId}
    //http://localhost:5173/
    //http://127.0.0.1:5500
    return { accessToken, refreshToken, userId: user.userId };
  }
}
