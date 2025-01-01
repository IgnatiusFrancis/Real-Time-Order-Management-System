import { Module } from '@nestjs/common';
import { ConfigModule, WsGuard } from './utils';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './utils/interceptors/user.interceptor';
import { GlobalExceptionFilter } from './utils/filters/httpExceptionFilter';
import { JwtAuthService } from './utils/token.generators';
import { OrderModule } from './order/order.module';
import { ChatModule } from './chat/chat.module';
import { AuthGuard } from './utils/guards/role.guard';

@Module({
  imports: [ConfigModule, AuthModule, OrderModule, ChatModule],
  providers: [
    JwtAuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
