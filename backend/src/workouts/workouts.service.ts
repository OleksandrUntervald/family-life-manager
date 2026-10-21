import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workout } from './schemas/workout.schema.js';
import { CreateWorkoutDto } from './dto/create-workout.dto.js';

@Injectable()
export class WorkoutsService {
    constructor(@InjectModel(Workout.name) private workoutModel: Model<Workout>) {}

    // Створення нового запису (прив'язуємо до ID користувача)
    async create(userId: string, dto: CreateWorkoutDto): Promise<Workout> {
        const newWorkout = new this.workoutModel({
            ...dto,
            userId,
        });
        return newWorkout.save();
    }

    // Отримання всіх тренувань конкретного користувача (сортуємо від найновіших)
    async findAll(userId: string): Promise<Workout[]> {
        return this.workoutModel
            .find({ userId })
            .sort({ date: -1 }) // -1 - найновіші тренування будуть зверху
            .exec();
    }

    // Видалення тренування (перевіряємо і ID запису, і ID користувача)
    async remove(id: string, userId: string): Promise<void> {
        const result = await this.workoutModel.deleteOne({ _id: id, userId }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Тренування не знайдено або у вас немає доступу');
        }
    }

    async updateWorkout(userId: string, id: string, updateData: any) {
        return this.workoutModel.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true }
        ).exec();
    }
}