import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthService } from '../utils/token.generators';
import { PrismaService } from '../utils/prisma';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthService, PrismaService],
})
export class AuthModule {}
