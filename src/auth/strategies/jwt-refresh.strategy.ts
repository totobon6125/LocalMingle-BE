// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UsersService } from '../../users/users.service';

// @Injectable()
// export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
//   constructor(
//     private jwtService: JwtService,
//     private usersService: UsersService
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromHeader('refreshtoken'), // 헤더에서 리프레시 토큰을 추출
//       secretOrKey: process.env.JWT_REFRESH_KEY,
//     });
//   }

//   async validate(payload: any, @Request() req: any) {
//     // 'refreshtoken' 헤더에서 refreshToken을 추출
//     const refreshToken = req.headers.refreshtoken as string;
//     console.log('리프레시토큰 확인', refreshToken);
//     if (!refreshToken) {
//       throw new UnauthorizedException('Refresh token not provided');
//     }

//     try {
//       // 리프레시 토큰의 유효성을 검증
//       const decodedToken = this.jwtService.verify(refreshToken, {
//         secret: process.env.JWT_REFRESH_KEY,
//       });

//       // 유효한 사용자를 찾을 때 사용자 서비스를 활용
//       const user = await this.usersService.findById(decodedToken.sub);

//       if (!user) {
//         throw new UnauthorizedException('Invalid token');
//       }

//       // 사용자 정보를 반환
//       return { email: user.email, id: user.userId };
//     } catch (error) {
//       throw new UnauthorizedException('Invalid token');
//     }
//   }
// }
