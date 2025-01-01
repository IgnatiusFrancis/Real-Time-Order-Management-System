import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthService } from '../token.generators';
import { PrismaService } from '../prisma';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const jwt = request.headers['authorization']?.split(' ')[1];

    if (!jwt) {
      throw new HttpException(
        'Token not provided, please login.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const decoded: any = this.jwtAuthService.decodeAuthToken(jwt);

      const user = await this.prismaService.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new HttpException(
          'User not found, please login',
          HttpStatus.NOT_FOUND,
        );
      }

      request.user = user;
      return true;
    } catch (error) {
      throw error;
    }
  }
}
