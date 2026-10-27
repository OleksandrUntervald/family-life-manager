import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider.js';
import { CloudinaryService } from './cloudinary.service.js';

@Module({
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryProvider, CloudinaryService], // Експортуємо для модуля Фінансів
})
export class CloudinaryModule {}