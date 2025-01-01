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
import { CustomWsException, WsStatus } from '../filters/custom-ws.exception';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const authorizationHeader: string = client.handshake.headers.authorization;

    if (!authorizationHeader) {
      throw new CustomWsException(
        'Authorization header not provided',
        WsStatus.NOT_FOUND,
      );
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
      throw new CustomWsException('Token not provided', WsStatus.NOT_FOUND);
    }
    try {
      const decoded: any = this.jwtAuthService.decodeAuthToken(token);

      const user = await this.prismaService.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new CustomWsException('Invalid token', WsStatus.UNAUTHORIZED);
      }

      // Attach user to the WebSocket handshake for further use.
      client.handshake.auth.user = user;

      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
