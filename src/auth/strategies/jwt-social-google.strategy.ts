import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service'; // 프리즈마 서비스 파일 경로를 사용하는 경로로 수정해야 합니다.
import { Inject } from '@nestjs/common';

// @Injectable()
export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PrismaService) private readonly prismaService: PrismaService
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('google 엑세스토큰:', accessToken);
    console.log('google 리프레시 토큰:', refreshToken);
    console.log('google 프로필:', profile);

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(profile.id.toString(), 10);

    // 고유한 익명 nickname 생성
    const nickname = await this.generateUniqueAnonymousName();
    return {
      name: profile.displayName,
      email: profile.emails[0].value,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      nickname: nickname,
      profileImg: '기본이미지 url',
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

      // 프리즈마를 사용하여 중복 확인
      const existingUser = await this.prisma.userDetail.findUnique({
        where: { nickname: anonymousName },
      });

      if (!existingUser) {
        return anonymousName; // 중복되지 않는 이름 반환
      }
    }
  }
}
