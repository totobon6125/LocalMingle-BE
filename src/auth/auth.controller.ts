import { Body, Controller, Post, Res, Headers } from '@nestjs/common'; // Headers 추가
import { AuthService } from './auth.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { AuthEntity } from './entity/auth.entity';

interface IOAuthUser {
  //interface 설정
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
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인에 성공하셨습니다.' })
  @ApiResponse({ status: 404, description: '이메일이 없습니다.' })
  @ApiResponse({ status: 401, description: '비밀번호가 일치하지 않습니다.' })
  @Post('login')
  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) res: Response, // Response 객체 주입
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.login({
      email,
      password,
    });

    // 엑세스 토큰을 HTTP 응답 헤더에 추가
    res.header('accessToken', accessToken);

    // 리프레시 토큰을 쿠키로 설정하여 클라이언트에게 전달
    // httpOnly : javascript 로 쿠키에 접근 할 수 없는 옵션
    // secure : true 일 시 https 연결에서만 전송된다.
    // 리프레시 토큰을 HTTP 응답 헤더에 추가
    res.header('refreshToken', refreshToken);

    //res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });

    // 액세스 토큰을 클라이언트에게 JSON 응답으로 반환 (Response body 에 전송)
    //res.status(200).json({ accessToken }); // 클라이언트에게 JSON 응답을 보냄
  }

  // 리프레시 토큰을 사용하여 엑세스 토큰 재발급을 위한 엔드포인트 추가
  @ApiOperation({ summary: '리프레시 토큰을 사용하여 엑세스 토큰 재발급' })
  @ApiResponse({
    status: 200,
    description: '엑세스 토큰 재발급에 성공하셨습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '리프레시 토큰이 유효하지 않습니다.',
  })
  @Post('refresh')
  async refreshAccessToken(
    @Headers('refreshToken') refreshToken: string, // 요청 헤더에서 refresh-token 값을 추출
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      // 리프레시 토큰을 사용하여 새로운 엑세스 토큰 발급
      const newAccessToken =
        await this.authService.refreshAccessToken(refreshToken);

      // 새로운 엑세스 토큰을 HTTP 응답 헤더에 추가
      res.header('access-token', newAccessToken);

      // 액세스 토큰을 클라이언트에게 JSON 응답으로 반환 (Response body 에 전송)
      //res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      // 리프레시 토큰이 유효하지 않은 경우 에러 처리
      res
        .status(401)
        .json({ errorMessage: '리프레시 토큰이 유효하지 않습니다.' });
    }
  }
}
