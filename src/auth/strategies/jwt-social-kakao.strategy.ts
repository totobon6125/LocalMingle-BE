import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service'; // 프리즈마 서비스 파일 경로를 사용하는 경로로 수정해야 합니다.
import { Inject } from '@nestjs/common';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PrismaService) private readonly prismaService: PrismaService // 추가
  ) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
      scope: ['account_email', 'profile_nickname'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('카카오에서 주는 accessToken:' + accessToken);
    console.log('카카오에서 주는 refreshToken:' + refreshToken);
    console.log('카카오 프로필', profile);
    console.log(profile._json.kakao_account.email);

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(profile.id.toString(), 10);

    // 고유한 익명 nickname 생성
    const nickname = await this.generateUniqueAnonymousName();
    //console.log('닉네임 확인', nickname);
    return {
      name: profile.displayName,
      email: profile._json.kakao_account.email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      nickname: nickname,
      profileImg: '기본이미지 url',
      accessToken: profile._json.kakao_account.access,
      refreshToken: profile._json.kakao_account.refresh,
    };
  }

  private async generateUniqueAnonymousName(): Promise<string> {
    const anonymousPrefix = '익명';
    const randomLength = 6;
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    while (true) {
      let randomString = '';
      for (let i = 0; i < randomLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
      }

      const anonymousName = `${anonymousPrefix}${randomString}`;

      //return anonymousName; // 밑의 로직이 작동안하면 임시적으로 사용

      // // 프리즈마를 사용하여 중복 확인
      const existingUser = await this.prisma.userDetail.findUnique({
        where: { nickname: anonymousName },
      });

      if (!existingUser) {
        return anonymousName; // 중복되지 않는 이름 반환
      }
    }
  }
}
