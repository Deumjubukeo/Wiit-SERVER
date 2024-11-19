import { CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: any): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }

  private extractToken(client: Socket): string {
    const auth = client.handshake.headers.authorization;
    if (!auth) {
      throw new WsException('No token provided');
    }
    return auth.replace('Bearer ', '');
  }
}
