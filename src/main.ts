// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('WiitServer')
    .setDescription('Swagger munseo docs')
    .setVersion('1.0')
    .addTag('sinmintang')
    .build();

  app.enableCors({
    origin: ['http://localhost:3000'], // React 앱의 URL
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(8080);
}
bootstrap();
