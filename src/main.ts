// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
//import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('LocalMingle API')
    .setDescription('The LocalMingle API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // // CORS 설정
  // app.enableCors({
  //   origin: '*', // 클라이언트 애플리케이션의 주소로 변경 개발단계라서 *로 한것 배포시 수정해야함
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true, // 쿠키를 사용하려면 true로 설정
  // });

  await app.listen(3000);
}
bootstrap();
