import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { setupSwagger } from './utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/');
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 1000 * 60 * 60,
      max: 1000,
      message:
        '⚠️  Too many request created from this IP, please try again after an hour',
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Setup Swagger
  setupSwagger(app);

  const logger = new Logger('bootstrap');

  await app.listen(configService.get('PORT'), () => {
    return logger.log(`🚀 Server running on port ${configService.get('PORT')}`);
  });
}
bootstrap().catch((e) => {
  Logger.error(`❌  Error starting server, ${e}`, '', 'Bootstrap', false);
  throw e;
});
