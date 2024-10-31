import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import RegisterDto from './dto/register.dto';
import TokenPayload from './tokenPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registrationData: RegisterDto) {
    if (!registrationData.password) {
      throw new HttpException('비밀번호는 필수입니다.', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(registrationData.password, 10);

    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      });
      createdUser.password = undefined; // 비밀번호 숨기기
      return createdUser;
    } catch (error) {
      throw new HttpException(
        '사용자 ID 또는 전화번호가 이미 존재합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getAuthenticatedUser(userId: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getById(userId);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException(
        '잘못된 인증 정보입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new HttpException('잘못된 인증 정보입니다.', HttpStatus.BAD_REQUEST);
    }
  }

  public getCookieWithJwtToken(userId: string) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      expiresIn: '1h', // 만료 시간 설정
    });
    return token;
  }

  public getCookieWithRefreshToken(userId: string) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      expiresIn: '7d', // 만료 시간 설정
    });
    return token;
  }

  public verifyRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload.userId;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new HttpException(
        '리프레시 토큰이 유효하지 않습니다.',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  public async refreshTokens(userId: string) {
    const accessToken = this.getCookieWithJwtToken(userId);
    const refreshToken = this.getCookieWithRefreshToken(userId);
    return {
      accessToken,
      refreshToken,
    };
  }
}
