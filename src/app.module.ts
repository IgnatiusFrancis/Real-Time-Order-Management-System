import { Module } from '@nestjs/common';
import { ConfigModule } from './utils';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './utils/interceptors/user.interceptor';
import { AllExceptionsFilter } from './utils/filters/httpExceptionFilter';
import { JwtAuthService } from './utils/token.generators';
import { OrderModule } from './order/order.module';

@Module({
  imports: [ConfigModule, AuthModule, OrderModule],
  providers: [
    JwtAuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
