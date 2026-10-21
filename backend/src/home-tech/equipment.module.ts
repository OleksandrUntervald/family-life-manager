import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquipmentService } from './equipment.service.js';
import { EquipmentController } from './equipment.controller.js';
import { Equipment, EquipmentSchema } from './schemas/equipment.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Equipment.name, schema: EquipmentSchema }]),
    ],
    controllers: [EquipmentController],
    providers: [EquipmentService],
})
export class EquipmentModule {}