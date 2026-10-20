import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema.js';
import { RegisterDto } from '../auth/dto/register.dto.js';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    // Пошук користувача за email
    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    // Створення нового користувача
    async create(dto: RegisterDto): Promise<User> {
        // 1. Перевіряємо, чи існує вже такий email
        const existingUser = await this.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('Користувач з таким email вже існує');
        }

        // 2. Хешуємо пароль (використовуємо bcrypt з "сіллю" 10 раундів)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);

        // 3. Зберігаємо користувача в базу
        const newUser = new this.userModel({
            email: dto.email,
            name: dto.name,
            passwordHash,
        });

        return newUser.save();
    }

    // Оновлення параметрів користувача (зріст, вік, цільова вага тощо)
    async updateSettings(userId: string, updateData: any) {
        return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
    }
}