import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'userId' });
  }

  async validate(userId: string, password: string): Promise<User> {
    return this.authService.getAuthenticatedUser(userId, password);
  }
}
