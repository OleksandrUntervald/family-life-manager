import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipment } from './schemas/equipment.schema.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UploadedFileType } from '../common/interfaces/uploaded-file.interface.js';

@Injectable()
export class EquipmentService {
    constructor(
        @InjectModel(Equipment.name) private equipmentModel: Model<Equipment>,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async findAll(userId: string): Promise<Equipment[]> {
        return this.equipmentModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }

    async create(
        userId: string,
        dto: CreateEquipmentDto,
        file?: UploadedFileType,
    ): Promise<Equipment> {
        let photoUrl = '';
        if (file) {
            photoUrl = await this.cloudinaryService.uploadFile(file, 'lifemanager_equipment');
        }

        const newEquipment = new this.equipmentModel({
            ...dto,
            ...(photoUrl && { photoUrl }),
            userId,
        });
        return newEquipment.save();
    }

    async remove(userId: string, id: string): Promise<{ deleted: boolean }> {
        const deleted = await this.equipmentModel.findOneAndDelete({ _id: id, userId }).exec();
        if (!deleted) {
            throw new NotFoundException('Запис про обладнання не знайдено або немає доступу');
        }
        return { deleted: true };
    }

    async update(
        userId: string,
        id: string,
        dto: UpdateEquipmentDto,
        file?: UploadedFileType,
    ): Promise<Equipment> {
        const safeUpdate: Record<string, any> = {};
        if (dto.name !== undefined) safeUpdate.name = dto.name;
        if (dto.category !== undefined) safeUpdate.category = dto.category;
        if (dto.lastServiceDate !== undefined) safeUpdate.lastServiceDate = dto.lastServiceDate;
        if (dto.nextServiceDate !== undefined) safeUpdate.nextServiceDate = dto.nextServiceDate;
        if (dto.mileageOrNote !== undefined) safeUpdate.mileageOrNote = dto.mileageOrNote;
        if (dto.comment !== undefined) safeUpdate.comment = dto.comment;

        if (file) {
            safeUpdate.photoUrl = await this.cloudinaryService.uploadFile(
                file,
                'lifemanager_equipment',
            );
        }

        const updated = await this.equipmentModel
            .findOneAndUpdate(
                { _id: id, userId },
                { $set: safeUpdate },
                { new: true, runValidators: true },
            )
            .exec();

        if (!updated) {
            throw new NotFoundException('Запис про обладнання не знайдено або немає доступу');
        }
        return updated;
    }
}