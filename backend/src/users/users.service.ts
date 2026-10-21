import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
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

    // Оновлення імені профілю
    async updateProfile(userId: string, name: string) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { name },
            { new: true }
        ).select('-passwordHash').exec(); // Повертаємо без хешу пароля
    }

    // Зміна пароля
    async updatePassword(userId: string, oldPass: string, newPass: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new BadRequestException('Користувача не знайдено');

        // Перевіряємо старий пароль
        const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
        if (!isMatch) {
            throw new BadRequestException('Невірний старий пароль');
        }

        // Хешуємо та зберігаємо новий
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPass, salt);
        await user.save();

        return { message: 'Пароль успішно змінено' };
    }
}