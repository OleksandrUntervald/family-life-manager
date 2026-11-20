import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Health } from './schemas/health.schema.js';
import { CreateHealthDto } from './dto/create-health.dto.js';
import { User } from '../users/schemas/user.schema.js';

const DEFAULT_HEIGHT_CM = 170;
const DEFAULT_AGE_YEARS = 30;
const DEFAULT_GENDER = 'male';
const DEFAULT_TARGET_WEIGHT_KG = 70;

const BMR_WEIGHT_COEFF = 10;
const BMR_HEIGHT_COEFF = 6.25;
const BMR_AGE_COEFF = 5;
const BMR_MALE_OFFSET = 5;
const BMR_FEMALE_OFFSET = -161;

const SEDENTARY_ACTIVITY_MULTIPLIER = 1.2;
const WEIGHT_LOSS_DEFICIT_KCAL = 500;
const KCAL_PER_STEP_PER_KG = 0.00045;

@Injectable()
export class HealthService {
    constructor(
        @InjectModel(Health.name) private healthModel: Model<Health>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async upsert(userId: string, dto: CreateHealthDto): Promise<Health> {
        const userObjectId = new Types.ObjectId(userId);
        return this.healthModel
            .findOneAndUpdate(
                { userId: { $in: [userId, userObjectId] }, date: dto.date },
                { $set: { ...dto, userId: userObjectId } },
                { new: true, upsert: true, runValidators: true },
            )
            .exec();
    }

    async findAll(userId: string): Promise<Health[]> {
        return this.healthModel
            .find({ userId: { $in: [userId, new Types.ObjectId(userId)] } })
            .sort({ date: -1 })
            .exec();
    }

    async getDailyStats(userId: string, date: string) {
        const userFilter = { $in: [userId, new Types.ObjectId(userId)] };
        const [user, record] = await Promise.all([
            this.userModel.findById(userId).exec(),
            this.healthModel.findOne({ userId: userFilter, date }).exec(),
        ]);

        let currentWeight: number | null = record?.weight && record.weight > 0 ? record.weight : null;
        if (!currentWeight) {
            const lastRecord = await this.healthModel
                .findOne({ userId: userFilter, weight: { $gt: 0 } })
                .sort({ date: -1 })
                .exec();
            currentWeight = lastRecord?.weight ?? null;
        }

        const steps = record?.steps || 0;
        const consumedCalories = record?.consumedCalories || 0;
        const water = record?.water || 0;

        const userHeight = user?.height || DEFAULT_HEIGHT_CM;
        const userAge = user?.age || DEFAULT_AGE_YEARS;
        const userGender = user?.gender || DEFAULT_GENDER;

        let bmr = 0;
        let burnedFromSteps = 0;
        let dynamicCalorieGoal = 0;
        let caloriesLeft = 0;

        if (currentWeight !== null) {
            bmr =
                BMR_WEIGHT_COEFF * currentWeight +
                BMR_HEIGHT_COEFF * userHeight -
                BMR_AGE_COEFF * userAge +
                (userGender === 'male' ? BMR_MALE_OFFSET : BMR_FEMALE_OFFSET);

            const baseCalorieGoal = bmr * SEDENTARY_ACTIVITY_MULTIPLIER - WEIGHT_LOSS_DEFICIT_KCAL;
            burnedFromSteps = Math.round(steps * currentWeight * KCAL_PER_STEP_PER_KG);
            dynamicCalorieGoal = Math.round(baseCalorieGoal + burnedFromSteps);
            caloriesLeft = dynamicCalorieGoal - consumedCalories;
        }

        return {
            record: record || {
                date,
                consumedCalories: 0,
                steps: 0,
                weight: 0,
                water: 0,
            },
            userParams: {
                height: userHeight,
                age: userAge,
                gender: userGender,
                targetWeight: user?.targetWeight || DEFAULT_TARGET_WEIGHT_KG,
            },
            stats: {
                currentWeight,
                bmr: Math.round(bmr),
                burnedFromSteps,
                dynamicCalorieGoal,
                caloriesLeft,
                water,
            },
        };
    }
}