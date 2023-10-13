// src/main.ts

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 유효성 검사를 위한 ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // 인터셉터를 사용하여 응답 본문에서 비밀번호를 자동으로 제거

  const config = new DocumentBuilder()
    .setTitle('LocalMingle API')
    .setDescription('The LocalMingle API description')
    .setVersion('0.1')
    .addBearerAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
