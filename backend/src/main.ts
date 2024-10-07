import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser(process.env.COOKIES_SECRET));
  app.enableCors({
    origin: process.env.CORS_ORIGIN.split(' '),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  await app.listen(process.env.API_PORT || 3000, () => console.log(`API spins on: ${process.env.API_PORT || 3000}`));
}
bootstrap();
