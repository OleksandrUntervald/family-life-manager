import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    // Замінили Express.Multer.File на any, щоб зняти помилку TS
    async uploadFile(file: any, folderName: string = 'lifemanager_finance'): Promise<string> {
        // Перетворюємо файл у Base64-формат для відправки напряму з пам'яті
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folderName,
        });

        return result.secure_url;
    }
}