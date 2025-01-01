import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
  const configService = app.get(ConfigService);

  const swaggerConfig = {
    docTitle: configService.get<string>('SWAGGER_DOC_TITLE'),
    docDescription: configService.get<string>('SWAGGER_DOC_DESCRIPTION'),
    docVersion: configService.get<string>('SWAGGER_DOC_VERSION'),
    path: configService.get<string>('SWAGGER_PATH'),
    siteTitle: configService.get<string>('SWAGGER_SITE_TITLE'),
    defaultModelsExpandDepth: configService.get<number>(
      'SWAGGER_MODELS_EXPAND_DEPTH',
    ),
  };

  const config = new DocumentBuilder()
    .setTitle(swaggerConfig?.docTitle)
    .setDescription(swaggerConfig?.docDescription)
    .setVersion(swaggerConfig?.docVersion)
    .addBearerAuth()
    .build();

  const documentOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, documentOptions);

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: swaggerConfig.defaultModelsExpandDepth,
    },
    customSiteTitle: swaggerConfig.siteTitle,
  };

  SwaggerModule.setup(swaggerConfig.path, app, document, customOptions);
};
