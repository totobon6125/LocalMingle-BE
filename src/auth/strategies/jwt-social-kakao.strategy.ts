import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import * as bcrypt from 'bcrypt';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
      scope: ['account_email', 'profile_nickname'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('카카오에서 주는 accessToken:' + accessToken); //이건 카카오에서 주는 엑세스토큰
    console.log('카카오에서 주는 refreshToken:' + refreshToken); // 이건 카카오에서 주는 리프레시 토큰임
    console.log(profile);
    console.log(profile._json.kakao_account.email);

    //비밀번호 암호화
    const hashedPassword = await bcrypt.hash(profile.id.toString(), 10);

    // 랜덤 nickname 생성
    const nickname = this.generateRandomNickname();

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

  private generateRandomNickname() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz가갸거겨고교구규그기끼끄나냐너녀노뇨누뉴눼뉘뉴다댜더데도됴두듀뒤듸라랴러려로료루류뤼르리리끼끄마먀머며모묘무뮤뮈뮤나냐너녀노뇨누뉴눼뉘뉴다댜더데도됴두듀뒤듸바뱌버벼보뵤부뷔뷰뷸뷰사싸서셔소쇼수슈수아야어여오요우유윈유자작저져조주쥐쥬쥐키';
    const minLength = 2; // 최소 길이
    const maxLength = 8; // 최대 길이
    const nicknameLength =
      Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    let nickname = '';
    for (let i = 0; i < nicknameLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      nickname += characters.charAt(randomIndex);
    }

    return nickname;
  }
}
