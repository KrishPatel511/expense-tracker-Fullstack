import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // DTO validation activate karta hai
  app.useGlobalFilters(new HttpExceptionFilter()); // consistent error response format

  // Browser kabhi bhi API responses ko cache na kare (GET requests bhi)
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
