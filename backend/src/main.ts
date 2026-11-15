import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { MongooseExceptionFilter } from './common/filters/mongoose-exception.filter.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    // Налаштування CORS для зв'язку з фронтендом на 3001 порті
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.useGlobalFilters(new MongooseExceptionFilter());

    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`🚀 Бекенд успішно запущено на порті ${port}`);
}

bootstrap().catch((err) => console.error(err));