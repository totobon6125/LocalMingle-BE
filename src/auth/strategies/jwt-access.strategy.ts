import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

//예시
// import {KaKaoStrategy} from 'passport-kakao'
// import {NaverStrategy} from 'passport-naver'

//1. 비밀번호 검증
//2. 만료시간 검증
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //엑세스 토큰
      secretOrKey: process.env.JWT_ACCESS_KEY, //비밀번호
    });
  }

  validate(payload) {
    //console.log('페이로드 확인', payload); // {sub ; 유저id}

    return {
      userId: payload.sub, // id -> userId로 변환 (페이로드에 담긴 유저id를 반환)
    };
  }
}
