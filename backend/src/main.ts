import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/errors/custom.errors';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Set a global prefix for all routes
    app.setGlobalPrefix('api/');

    // Enable CORS (allow all origins, or specify specific origins)
    app.enableCors();

    // Apply the global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen(process.env.PORT ?? 5000);
    console.log(
      `Application is running on: ${process.env.BACKEND_BASE_URL ?? 5000}`,
    );
  } catch (err) {
    console.error('Error during app startup:', err);
  }
}

bootstrap();
