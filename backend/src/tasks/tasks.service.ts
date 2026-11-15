import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<Task>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async create(userId: string, dto: CreateTaskDto): Promise<Task> {
        const user = await this.userModel.findById(userId);
        let familyId = null;

        if (dto.isShared) {
            if (!user?.familyId) {
                throw new BadRequestException('Ви не перебуваєте в родині, щоб створювати спільні завдання');
            }
            familyId = user.familyId;
        }

        const newTask = new this.taskModel({
            title: dto.title,
            ...(dto.date && { date: dto.date }),
            ...(dto.notes !== undefined && { notes: dto.notes }),
            ...(dto.assignedTo !== undefined && { assignedTo: dto.assignedTo }),
            ...(dto.status && { status: dto.status }),
            userId,
            familyId,
            isShared: Boolean(dto.isShared),
        });
        return newTask.save();
    }

    async findAll(userId: string, isShared: boolean): Promise<Task[]> {
        const user = await this.userModel.findById(userId);
        let query: Record<string, any> = {};

        if (isShared) {
            if (!user?.familyId) return [];
            query = { familyId: user.familyId, isShared: true };
        } else {
            query = { userId, isShared: { $ne: true } };
        }

        return this.taskModel.find(query).sort({ date: 1, status: 1, createdAt: -1 }).exec();
    }

    async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
        const user = await this.userModel.findById(userId);

        const query = user?.familyId
            ? { _id: id, $or: [{ userId }, { familyId: user.familyId, isShared: true }] }
            : { _id: id, userId };

        const result = await this.taskModel.deleteOne(query).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }
        return { deleted: true };
    }

    async updateTask(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
        const user = await this.userModel.findById(userId);

        const safeUpdate: Record<string, any> = {};
        if (dto.title !== undefined) safeUpdate.title = dto.title;
        if (dto.date !== undefined) safeUpdate.date = dto.date;
        if (dto.notes !== undefined) safeUpdate.notes = dto.notes;
        if (dto.assignedTo !== undefined) safeUpdate.assignedTo = dto.assignedTo;
        if (dto.status !== undefined) safeUpdate.status = dto.status;

        const query = user?.familyId
            ? { _id: id, $or: [{ userId }, { familyId: user.familyId, isShared: true }] }
            : { _id: id, userId };

        const updatedTask = await this.taskModel
            .findOneAndUpdate(
                query,
                { $set: safeUpdate },
                { new: true, runValidators: true },
            )
            .exec();

        if (!updatedTask) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }
        return updatedTask;
    }
}