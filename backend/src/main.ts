import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AccessGuard } from './common/guards/access/access.guard';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('BierCounter API')
      .setDescription('Event-Logging für die DHBW Heidenheim WWI2024')
      .setVersion('1.0')
      .addApiKey(
        { type: 'apiKey', in: 'header', name: 'x-access-key' },
        'access-key',
      )
      .addSecurityRequirements('access-key')
      .addServer('http://localhost:3000/api/v1')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.setGlobalPrefix('api');

  // To enable the AccessGuard globally, uncomment the following line:
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AccessGuard(reflector));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
