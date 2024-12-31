import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtAuthService } from '../token.generators';
import { PrismaService } from '../prisma';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake?.auth?.token;

    if (!token) {
      throw new WsException('Unauthorized: Token is missing');
    }

    try {
      const decoded: any = this.jwtAuthService.decodeAuthToken(token);

      const user = await this.prismaService.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }

      // Attach user to the WebSocket handshake for further use
      client.handshake.auth.user = user;
      return true;
    } catch (error) {
      throw new WsException('Unauthorized: Invalid or expired token');
    }
  }
}
