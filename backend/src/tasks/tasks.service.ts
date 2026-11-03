import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<Task>,
        @InjectModel(User.name) private userModel: Model<User>
    ) {}

    async create(userId: string, dto: CreateTaskDto): Promise<Task> {
        const user = await this.userModel.findById(userId);
        let familyId = null;

        if (dto.isShared) {
            if (!user?.familyId) throw new BadRequestException('Ви не перебуваєте в родині, щоб створювати спільні завдання');
            familyId = user.familyId;
        }

        const newTask = new this.taskModel({
            ...dto,
            userId,
            familyId,
            isShared: dto.isShared || false,
        });
        return newTask.save();
    }

    async findAll(userId: string, isShared: boolean): Promise<Task[]> {
        const user = await this.userModel.findById(userId);
        let query: any = {};

        if (isShared) {
            if (!user?.familyId) return []; // Якщо немає родини, просто повертаємо порожній список
            query = { familyId: user.familyId, isShared: true };
        } else {
            // $ne: true означає "false або відсутнє" (щоб старі таски відображалися)
            query = { userId, isShared: { $ne: true } };
        }

        return this.taskModel.find(query).sort({ date: 1, status: 1, createdAt: -1 }).exec();
    }

    async remove(id: string, userId: string): Promise<void> {
        const user = await this.userModel.findById(userId);

        // Маємо право видалити, якщо це наша особиста таска, АБО це таска нашої родини
        const query = user?.familyId
            ? { _id: id, $or: [{ userId }, { familyId: user.familyId, isShared: true }] }
            : { _id: id, userId };

        const result = await this.taskModel.deleteOne(query).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }
    }

    async updateTask(userId: string, id: string, updateData: any) {
        const user = await this.userModel.findById(userId);

        delete updateData.userId;
        delete updateData.familyId;
        delete updateData.isShared;
        delete updateData._id;

        const query = user?.familyId
            ? { _id: id, $or: [{ userId }, { familyId: user.familyId, isShared: true }] }
            : { _id: id, userId };

        const updatedTask = await this.taskModel.findOneAndUpdate(
            query,
            { $set: updateData },
            { new: true }
        ).exec();

        if (!updatedTask) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }
        return updatedTask;
    }
}