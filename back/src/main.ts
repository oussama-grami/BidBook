import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Enable cookie parser middleware
  app.use(cookieParser());

  // Add Helmet for security headers but allow images to be loaded from the same origin
  app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'", // Needed for inline scripts used by Playground
              'https://cdn.jsdelivr.net', // Allow GraphQL Playground scripts
            ],
            styleSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://cdn.jsdelivr.net',
            ],
            imgSrc: [
              "'self'",
              'data:',
              'https://cdn.jsdelivr.net',
            ],
            connectSrc: ["'self'", 'https://cdn.jsdelivr.net'],
            fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
          },
        },
        crossOriginResourcePolicy: {
          policy: 'cross-origin',
        },
      }),
  );

  // Serve static assets with appropriate prefixes
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
    setHeaders: (res, path) => {
      if (
        path.endsWith('.png') ||
        path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.svg')
      ) {
        // Set proper CORS headers for images
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        // Improve caching behavior for profile images
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  });
  app.useStaticAssets(join(__dirname, '..', '.upload', 'book'), {
    prefix: '/public/uploads/books', 
  });

  
  // Enable CORS with credentials
  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL') || 'http://localhost:4200',
      'http://localhost:4200',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Books Project')
    .setDescription('The nestjs booksproject API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(configService.get<number>('APP_PORT') ?? 3000);
}

bootstrap();
