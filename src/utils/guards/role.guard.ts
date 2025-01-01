import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma';
import { JwtAuthService } from '../token.generators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtAuthService: JwtAuthService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRole = this.reflector.getAllAndOverride<string>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRole) {
      return true;
    }

    const user = await this.validateUser(context);

    // Check if the user's role is included in the required roles
    const hasRequiredRole = requiredRole.includes(user.role);

    if (!hasRequiredRole) {
      throw new UnauthorizedException('Access Denied');
    }

    return true;
  }

  private async validateUser(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const jwt = request.headers['authorization']?.split(' ')[1];

    if (!jwt) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }

    const decoded: any = this.jwtAuthService.decodeAuthToken(jwt);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
