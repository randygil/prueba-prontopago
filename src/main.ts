import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.enableCors();
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      errorHttpStatusCode: 422,
    }),
  );

  const docConfig = new DocumentBuilder()
    .setTitle('Prueba tecnica')
    .setDescription('Prueba tecnica API description')
    .setVersion('1.0')
    .addBearerAuth()

    // .addTag('Clinica')
    .build();
  patchNestjsSwagger();
  const documentFactory = () => SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(config.port);
}
bootstrap();
