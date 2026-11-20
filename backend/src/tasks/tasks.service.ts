import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

    private getUserIdFilter(userId: string) {
        return { $in: [userId, new Types.ObjectId(userId)] };
    }

    async create(userId: string, dto: CreateTaskDto): Promise<Task> {
        const user = await this.userModel.findById(userId);
        let familyId: Types.ObjectId | null = null;

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
            userId: new Types.ObjectId(userId),
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
            query = { userId: this.getUserIdFilter(userId), isShared: { $ne: true } };
        }

        return this.taskModel.find(query).sort({ createdAt: -1, date: -1 }).exec();
    }

    async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
        const user = await this.userModel.findById(userId);
        const userFilter = this.getUserIdFilter(userId);

        const query = user?.familyId
            ? { _id: id, $or: [{ userId: userFilter }, { familyId: user.familyId, isShared: true }] }
            : { _id: id, userId: userFilter };

        const result = await this.taskModel.deleteOne(query).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }
        return { deleted: true };
    }

    async updateTask(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
        const user = await this.userModel.findById(userId);
        const userFilter = this.getUserIdFilter(userId);

        const query = user?.familyId
            ? { _id: id, $or: [{ userId: userFilter }, { familyId: user.familyId, isShared: true }] }
            : { _id: id, userId: userFilter };

        const updatedTask = await this.taskModel
            .findOneAndUpdate(
                query,
                { $set: dto },
                { new: true, runValidators: true },
            )
            .exec();

        if (!updatedTask) {
            throw new NotFoundException('Завдання не знайдено або немає доступу');
        }
        return updatedTask;
    }
}