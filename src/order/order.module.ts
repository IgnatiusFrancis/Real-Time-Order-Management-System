import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { JwtAuthService } from '../utils/token.generators';

@Module({
  controllers: [OrderController],
  providers: [OrderService, JwtAuthService],
})
export class OrderModule {}
