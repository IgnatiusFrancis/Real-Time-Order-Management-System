import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './utils';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './utils/interceptors/user.interceptor';
import { AllExceptionsFilter } from './utils/filters/httpExceptionFilter';
import { JwtAuthService } from './utils/token.generators';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
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
