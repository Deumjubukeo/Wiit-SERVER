// src/auth/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Bearer 토큰 추출

    if (!token) {
      throw new UnauthorizedException('인증 토큰이 필요합니다.');
    }

    try {
      const payload = this.jwtService.verify(token); // 토큰 검증
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 인증 토큰입니다.');
    }
  }
}
