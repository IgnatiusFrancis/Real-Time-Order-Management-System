import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from 'src/utils';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthService } from 'src/utils/token.generators';

@Module({
  controllers: [OrderController],
  providers: [OrderService, JwtAuthService],
})
export class OrderModule {}
