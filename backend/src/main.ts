import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    // ВИПРАВЛЕНО: Нормальний CORS для роботи з різними портами
    app.enableCors({
        origin: true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // ВИДАЛЕНО: ProfanityInterceptor (щоб не псував паролі та українські назви міст)

    await app.listen(3000);
}

bootstrap().catch((err) => console.error(err));