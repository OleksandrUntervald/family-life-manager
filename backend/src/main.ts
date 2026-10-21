import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { ProfanityInterceptor } from './common/profanity.interceptor.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    app.enableCors({
        origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Підключаємо глобальний фільтр нецензурної лексики
    app.useGlobalInterceptors(new ProfanityInterceptor());

    await app.listen(3000);
}
// Обробляємо проміс, щоб WebStorm не сварився
bootstrap().catch((err) => console.error(err));