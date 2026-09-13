import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port =
    configService.get<number>('API_PORT') ?? 3001;

  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ??
    'http://localhost:3000';

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Web Ẩm Thực API')
    .setDescription(
      'API cho nền tảng quản lý và sáng tạo ẩm thực cá nhân hóa',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument =
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'api/docs',
    app,
    swaggerDocument,
  );

  await app.listen(port);

  console.log(
    `API: http://localhost:${port}/api/v1`,
  );

  console.log(
    `Swagger: http://localhost:${port}/api/docs`,
  );
}

void bootstrap();