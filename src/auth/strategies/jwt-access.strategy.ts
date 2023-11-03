import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //엑세스 토큰
      secretOrKey: process.env.JWT_ACCESS_KEY, //비밀번호
    });
  }

  validate(payload) {
    // console.log('페이로드 확인', payload); // {sub ; 유저id}

    return {
      userId: payload.sub, // id -> userId로 변환 (페이로드에 담긴 유저id를 반환)
    };
  }
}
