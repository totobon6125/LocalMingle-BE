import {
  Body,
  Controller,
  Post,
  Headers,
  Get,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entity/auth.entity';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

interface IOAuthUser {
  user: {
    name: string;
    email: string;
    password: string;
  };
}

@Controller('users')
@ApiTags('Auth')
@ApiOkResponse({ type: AuthEntity })
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  //-----------------------로그인-----------------------------//
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인에 성공하셨습니다.' })
  @ApiResponse({ status: 404, description: '이메일이 없습니다.' })
  @ApiResponse({ status: 401, description: '비밀번호가 일치하지 않습니다.' })
  @Post('login')
  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const { accessToken, refreshToken, userId } = await this.authService.login({
      email,
      password,
      res,
    });
    res.header('accessToken', accessToken);
    res.header('refreshToken', refreshToken);
    res.status(200).json({ userId });
  }

  //-----------------------토큰 재발급-----------------------------//
  @Post('refresh')
  @ApiOperation({ summary: '리프레시 토큰을 사용하여 엑세스 토큰 재발급' })
  @ApiResponse({
    status: 200,
    description: '엑세스 토큰 재발급에 성공하셨습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '리프레시 토큰이 유효하지 않습니다.',
  })
  async refreshAccessToken(
    @Headers('refreshToken') refreshToken: string, // 요청 헤더에서 refresh-token 값을 추출
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    try {
      const newAccessToken =
        await this.authService.refreshAccessToken(refreshToken);

      // 새로운 엑세스 토큰을 HTTP 응답 헤더에 추가
      res.header('access-token', newAccessToken);
    } catch (error) {
      // 리프레시 토큰이 유효하지 않은 경우 에러 처리
      res
        .status(401)
        .json({ errorMessage: '리프레시 토큰이 유효하지 않습니다.' });
    }
  }

  //-----------------------카카오 로그인-----------------------------//
  @Get('/login/kakao')
  @ApiOperation({ summary: '카카오 소셜 로그인' })
  @UseGuards(AuthGuard('kakao'))
  async loginKakao(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response
  ) {
    this.authService.OAuthLogin({ req, res });
  }
  //-----------------------구글 로그인-----------------------------//
  @Get('/login/google') //restAPI만들기. 엔드포인트는 users/login/google.
  @ApiOperation({ summary: '구글 소셜 로그인' })
  @UseGuards(AuthGuard('google')) //인증과정을 거쳐야하기때문에 UseGuards를 써주고 passport인증으로 AuthGuard를 써준다. 이름은 google로
  async loginGoogle(
    @Req() req: Request & IOAuthUser,
    @Res() res: Response //Nest.js가 express를 기반으로 하기때문에 Request는 express에서 import한다.
  ) {
    //프로필을 받아온 다음, 로그인 처리해야하는 곳(auth.service.ts에서 선언해준다)
    this.authService.OAuthLogin({ req, res });
  }

  //-----------------------네이버 로그인-----------------------------//
  @Get('/login/naver')
  @ApiOperation({ summary: '네이버 소셜 로그인' })
  @UseGuards(AuthGuard('naver'))
  async loginNaver(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response
  ) {
    this.authService.OAuthLogin({ req, res });
  }
}
