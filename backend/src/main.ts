import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Set a global prefix for all routes
    app.setGlobalPrefix('api');

    // Enable CORS (allow all origins, or specify specific origins)
    app.enableCors();

    await app.listen(process.env.PORT ?? 5000);
    console.log(
      `Application is running on: ${process.env.BACKEND_BASE_URL ?? 5000}`,
    );
  } catch (err) {
    console.error('Error during app startup:', err);
  }
}

bootstrap();
