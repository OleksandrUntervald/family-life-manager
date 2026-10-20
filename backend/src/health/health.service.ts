import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Health } from './schemas/health.schema.js';
import { CreateHealthDto } from './dto/create-health.dto.js';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class HealthService {
    constructor(
        @InjectModel(Health.name) private healthModel: Model<Health>,
        @InjectModel(User.name) private userModel: Model<User>
    ) {}

    async upsert(userId: string, dto: CreateHealthDto): Promise<Health> {
        return this.healthModel.findOneAndUpdate(
            { userId, date: dto.date },
            { ...dto, userId },
            { new: true, upsert: true }
        ).exec();
    }

    async findAll(userId: string): Promise<Health[]> {
        return this.healthModel
            .find({ userId })
            .sort({ date: -1 })
            .exec();
    }

    // Магія калькуляцій та отримання денної статистики
    async getDailyStats(userId: string, date: string) {
        const user = await this.userModel.findById(userId).exec();
        const record = await this.healthModel.findOne({ userId, date }).exec();

        // Шукаємо вагу: якщо сьогодні ще не вводили, беремо останню відому
        let currentWeight = record?.weight;
        if (!currentWeight || currentWeight === 0) {
            const lastRecord = await this.healthModel.findOne({ userId, weight: { $gt: 0 } }).sort({ date: -1 }).exec();
            currentWeight = lastRecord?.weight || 75; // Якщо користувач новий, беремо 75 кг як стартову точку
        }

        const steps = record?.steps || 0;
        const consumedCalories = record?.consumedCalories || 0;
        const water = record?.water || 0;

        // Безпечні значення для формули, якщо користувач ще не зберіг свої параметри
        const userHeight = user?.height || 170;
        const userAge = user?.age || 30;
        const userGender = user?.gender || 'male';

        // 1. Базовий метаболізм (BMR) за формулою Міффліна-Сан Жеора
        let bmr = (10 * currentWeight) + (6.25 * userHeight) - (5 * userAge);
        bmr = userGender === 'male' ? bmr + 5 : bmr - 161;

        // 2. Базова ціль: BMR * 1.2 (мінімальна активність) - 500 ккал (дефіцит для схуднення)
        const baseCalorieGoal = (bmr * 1.2) - 500;

        // 3. Скільки спалено кроками (коректний коефіцієнт: ~0.045 ккал за 1 крок на 1 кг, переведений у кілокалорії)
        const burnedFromSteps = Math.round(steps * currentWeight * 0.00045);

        // 4. Скільки МОЖНА з'їсти сьогодні (ліміт розширюється, якщо ти багато ходиш)
        const dynamicCalorieGoal = Math.round(baseCalorieGoal + burnedFromSteps);
        const caloriesLeft = dynamicCalorieGoal - consumedCalories;

        return {
            // Поточні дані за день (для інпутів)
            record: record || { date, consumedCalories: 0, steps: 0, weight: currentWeight, water: 0 },
            // Параметри користувача (для редагування на фронтенді)
            userParams: {
                height: userHeight,
                age: userAge,
                gender: userGender,
                targetWeight: user?.targetWeight || 70
            },
            // Розрахована статистика
            stats: {
                currentWeight,
                bmr: Math.round(bmr),
                burnedFromSteps,
                dynamicCalorieGoal,
                caloriesLeft,
                water
            }
        };
    }
}