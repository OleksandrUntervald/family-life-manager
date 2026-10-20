import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema.js';
import { CreateTaskDto } from './dto/create-task.dto.js';

@Injectable()
export class TasksService {
    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

    // Створення завдання
    async create(userId: string, dto: CreateTaskDto): Promise<Task> {
        const newTask = new this.taskModel({
            ...dto,
            userId,
        });
        return newTask.save();
    }

    // Отримання всіх завдань (невиконані зверху, далі за датою)
    async findAll(userId: string): Promise<Task[]> {
        return this.taskModel
            .find({ userId })
            .sort({ date: 1 }) // 1 - сортування від найближчих до майбутніх дат
            .exec();
    }

    // Перемикання статусу (виконано / не виконано)
    async toggleComplete(id: string, userId: string): Promise<Task> {
        const task = await this.taskModel.findOne({ _id: id, userId }).exec();
        if (!task) {
            throw new NotFoundException('Завдання не знайдено');
        }
        task.isCompleted = !task.isCompleted; // змінюємо на протилежне
        return task.save();
    }

    // Видалення завдання
    async remove(id: string, userId: string): Promise<void> {
        const result = await this.taskModel.deleteOne({ _id: id, userId }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }
    }
}