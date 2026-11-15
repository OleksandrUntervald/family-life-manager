import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workout } from './schemas/workout.schema.js';
import { CreateWorkoutDto } from './dto/create-workout.dto.js';
import { UpdateWorkoutDto } from './dto/update-workout.dto.js';

@Injectable()
export class WorkoutsService {
    constructor(@InjectModel(Workout.name) private workoutModel: Model<Workout>) {}

    async create(userId: string, dto: CreateWorkoutDto): Promise<Workout> {
        const newWorkout = new this.workoutModel({
            title: dto.title,
            weight: dto.weight,
            reps: dto.reps,
            sets: dto.sets,
            ...(dto.date && { date: dto.date }),
            userId,
        });
        return newWorkout.save();
    }

    async findAll(userId: string): Promise<Workout[]> {
        return this.workoutModel
            .find({ userId })
            .sort({ date: -1, createdAt: -1 })
            .exec();
    }

    async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
        const result = await this.workoutModel.deleteOne({ _id: id, userId }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Тренування не знайдено або у вас немає доступу');
        }
        return { deleted: true };
    }

    async updateWorkout(
        userId: string,
        id: string,
        dto: UpdateWorkoutDto,
    ): Promise<Workout> {
        const safeUpdate: Record<string, any> = {};
        if (dto.title !== undefined) safeUpdate.title = dto.title;
        if (dto.weight !== undefined) safeUpdate.weight = dto.weight;
        if (dto.reps !== undefined) safeUpdate.reps = dto.reps;
        if (dto.sets !== undefined) safeUpdate.sets = dto.sets;
        if (dto.date !== undefined) safeUpdate.date = dto.date;

        const updated = await this.workoutModel
            .findOneAndUpdate(
                { _id: id, userId },
                { $set: safeUpdate },
                { new: true, runValidators: true },
            )
            .exec();

        if (!updated) {
            throw new NotFoundException('Тренування не знайдено або у вас немає доступу');
        }

        return updated;
    }
}