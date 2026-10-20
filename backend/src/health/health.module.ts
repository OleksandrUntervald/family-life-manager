import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthService } from './health.service.js';
import { HealthController } from './health.controller.js';
import { Health, HealthSchema } from './schemas/health.schema.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Health.name, schema: HealthSchema }]),
    UsersModule
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}