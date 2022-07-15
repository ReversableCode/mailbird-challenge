import ExpressSession from 'express-session';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the config service
  const configService = app.get(ConfigService);

  // Enable session
  app.use(
    ExpressSession({
      secret: configService.get('sessionSecret') || 'random-secret-used-for-session-encryption',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Setup nestjs interceptors, filters and validation pipe
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup api prefix
  app.setGlobalPrefix('api');

  // Setup swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mailbird Challenge API documentation')
    .setDescription('The Mailbird Challenge API documentation')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  // Start the server on port 9000
  await app.listen(9000);

  // Stop the server when unhandled exception occurs (mainly EPIPE)
  process.on('uncaughtException', (error) => {
    console.error('UncaughtException', error);
    app.close();
    process.exit(1);
  });
}

bootstrap();
