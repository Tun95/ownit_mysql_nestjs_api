import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Enable CORS (allow all origins, or specify specific origins)
    app.enableCors();

    await app.listen(process.env.PORT ?? 5000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (err) {
    console.error('Error during app startup:', err);
  }
}

bootstrap();
