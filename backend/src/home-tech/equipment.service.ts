import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipment } from './schemas/equipment.schema.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';

@Injectable()
export class EquipmentService {
    constructor(@InjectModel(Equipment.name) private equipmentModel: Model<Equipment>) {}

    // Отримати всі записи користувача
    async findAll(userId: string): Promise<Equipment[]> {
        return this.equipmentModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }

    // Створити або оновити запис про обслуговування
    async create(userId: string, dto: CreateEquipmentDto): Promise<Equipment> {
        const newEquipment = new this.equipmentModel({
            ...dto,
            userId,
        });
        return newEquipment.save();
    }

    // Видалити запис
    async remove(userId: string, id: string): Promise<Equipment | null> {
        return this.equipmentModel.findOneAndDelete({ _id: id, userId }).exec();
    }

    async update(userId: string, id: string, updateData: any) {
        return this.equipmentModel.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true }
        ).exec();
    }

}