import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import RegisterDto from './dto/register.dto';
import TokenPayload from './tokenPayload.interface';
import { QrCodeService } from '../qrCode/qrCode.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly qrCodeService: QrCodeService,
  ) {}

  public async register(registrationData: RegisterDto) {
    if (!registrationData.password) {
      throw new HttpException('비밀번호는 필수입니다.', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(registrationData.password, 5);

    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
        imageUrl: registrationData.imageUrl || '',
      });

      const qrCodeUrl = await this.qrCodeService.generateAndUploadQrCode(
        createdUser.id,
      );
      await this.usersService.updatePurchaseQrUrl(createdUser.id, qrCodeUrl);

      createdUser.password = undefined;
      return createdUser;
    } catch (e) {
      console.error(e);
      throw new HttpException(
        '사용자 ID 또는 전화번호가 이미 존재합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getAuthenticatedUser(userId: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.findOne(userId);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        '잘못된 인증 정보입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public getCookieWithJwtToken(id: string) {
    const payload: TokenPayload = { id };
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  public getCookieWithRefreshToken(id: string) {
    const payload: TokenPayload = { id };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
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

  public async refreshTokens(id: string) {
    const accessToken = this.getCookieWithJwtToken(id);
    const refreshToken = this.getCookieWithRefreshToken(id);
    return {
      accessToken,
      refreshToken,
    };
  }
}
