import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PremiumRequestsController } from './premium-requests.controller.js';
import { PremiumRequestsService } from './premium-requests.service.js';
import { PremiumRequest, PremiumRequestSchema } from './schemas/premium-request.schema.js';
import { UsersModule } from '../users/users.module.js';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PremiumRequest.name, schema: PremiumRequestSchema }]),
        UsersModule, // Імпортуємо, щоб мати доступ до UsersService
    ],
    controllers: [PremiumRequestsController],
    providers: [PremiumRequestsService],
})
export class PremiumRequestsModule {}