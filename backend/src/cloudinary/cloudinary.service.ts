import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadedFileType } from '../common/interfaces/uploaded-file.interface.js';

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class CloudinaryService {
    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadFile(
        file: UploadedFileType,
        folderName = 'lifemanager_finance',
    ): Promise<string> {
        if (!file || !file.buffer) {
            throw new BadRequestException('Файл не передано або він пошкоджений');
        }

        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(
                'Недопустимий тип файлу. Дозволені лише зображення (JPEG, PNG, WEBP, GIF).',
            );
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException(
                'Файл занадто великий. Максимальний розмір — 5 МБ.',
            );
        }

        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folderName,
        });

        return result.secure_url;
    }
}