import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthService {
  constructor(private readonly configService: ConfigService) {}

  generateAuthToken(id: string, role: UserRole) {
    const secretKey = this.configService.get<string>('JWT_SECRET');
    return jwt.sign({ id, role }, secretKey, {
      expiresIn: '1d',
    });
  }

  decodeAuthToken(token: string): string | object {
    try {
      const secretKey = this.configService.get<string>('JWT_SECRET');
      return jwt.verify(token, secretKey);
    } catch (error) {
      throw new HttpException(
        'Invalid or expired token, please login',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
