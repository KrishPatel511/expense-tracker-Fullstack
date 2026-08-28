import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription('All routes for Auth, Expenses, Dashboard & Reports')
    .setVersion('1.0')
    .addBearerAuth()  // "Authorize" button enable karta hai — JWT token paste karo
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // http://localhost:5000/api/docs

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📄 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
