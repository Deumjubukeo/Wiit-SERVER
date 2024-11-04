import { Controller, Post, Body, Res, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import LoginDto from "./dto/login.dto";
import RefreshDto from './dto/refresh.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}


  @Post('signup')
  @ApiOperation({ summary: '사용자 등록' }) // 메서드 요약
  @ApiResponse({ status: 201, description: '사용자 등록 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async register(@Body() registrationData: RegisterDto) {
    return this.authService.register(registrationData);
  }

  @Post('signin')
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 400, description: '잘못된 인증 정보' })
  async logIn(@Body() body: LoginDto) {
    const user = await this.authService.getAuthenticatedUser(
      body.userId,
      body.password,
    );
    const accessToken = this.authService.getCookieWithJwtToken(user.userId);
    const refreshToken = this.authService.getCookieWithRefreshToken(user.userId);
    if (user.userId) {
      return { accessToken, refreshToken };
    }
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshDto, @Res() res: Response) {
    if (!body.refreshToken) {
      throw new HttpException(
        '리프레시 토큰이 없습니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    // 리프레시 토큰을 검증하고 새 토큰 발급
    const userId = this.authService.verifyRefreshToken(body.refreshToken);
    const tokens = await this.authService.refreshTokens(userId);

    res.send(tokens);
  }
}
