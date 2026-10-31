import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema.js';
import { CreateTaskDto } from './dto/create-task.dto.js';

@Injectable()
export class TasksService {
    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

    async create(userId: string, dto: CreateTaskDto): Promise<Task> {
        const newTask = new this.taskModel({
            ...dto,
            userId,
        });
        return newTask.save();
    }

    async findAll(userId: string): Promise<Task[]> {
        return this.taskModel
            .find({ userId })
            // Сортування: спочатку недавні дати, потім статус, потім дата створення
            .sort({ date: 1, status: 1, createdAt: -1 })
            .exec();
    }

    async remove(id: string, userId: string): Promise<void> {
        const result = await this.taskModel.deleteOne({ _id: id, userId }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }
    }

    async updateTask(userId: string, id: string, updateData: any) {
        // Забороняємо оновлювати критичні поля
        delete updateData.userId;
        delete updateData._id;

        const updatedTask = await this.taskModel.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true }
        ).exec();

        if (!updatedTask) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }

        return updatedTask;
    }
}