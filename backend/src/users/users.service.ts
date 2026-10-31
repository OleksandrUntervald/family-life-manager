import { ConflictException, Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './schemas/user.schema.js';
import { RegisterDto } from '../auth/dto/register.dto.js';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async onModuleInit() {
        const adminEmail = 'admin@gmail.com';
        const existingAdmin = await this.findByEmail(adminEmail);

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('admin123', salt);
            await this.userModel.create({
                email: adminEmail,
                name: 'Super Admin',
                passwordHash,
                role: UserRole.ADMIN,
            });
            console.log('✅ Дефолтного суперадміна успішно створено!');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).select('-passwordHash').exec();
    }

    async create(dto: RegisterDto): Promise<User> {
        const existingUser = await this.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('Користувач з таким email вже існує');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);

        const newUser = new this.userModel({
            email: dto.email,
            name: dto.name,
            passwordHash,
        });

        return newUser.save();
    }

    async updateSettings(userId: string, updateData: any) {
        delete updateData.role;
        delete updateData.isBanned;
        delete updateData.passwordHash;
        delete updateData.email;

        return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
    }

    async updateProfile(userId: string, name: string) {
        if (!name || name.trim() === '') {
            throw new BadRequestException('Ім\'я не може бути порожнім');
        }
        return this.userModel.findByIdAndUpdate(
            userId,
            { name },
            { new: true }
        ).select('-passwordHash').exec();
    }

    async updatePassword(userId: string, oldPass: string, newPass: string) {
        if (!newPass || newPass.length < 6) {
            throw new BadRequestException('Новий пароль має містити щонайменше 6 символів');
        }

        const user = await this.userModel.findById(userId);
        if (!user) throw new BadRequestException('Користувача не знайдено');

        const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
        if (!isMatch) {
            throw new BadRequestException('Невірний старий пароль');
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPass, salt);
        await user.save();

        return { message: 'Пароль успішно змінено' };
    }

    // --- АДМІНСЬКІ МЕТОДИ ---

    async findAllUsers() {
        return this.userModel.find().select('-passwordHash').sort({ createdAt: -1 }).exec();
    }

    // ДОДАНО: Аналітика користувачів
    async getPlatformStats() {
        const [total, banned, admins, premiums] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ isBanned: true }),
            this.userModel.countDocuments({ role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } }),
            this.userModel.countDocuments({ role: UserRole.PREMIUM }),
        ]);

        return {
            totalUsers: total,
            bannedUsers: banned,
            adminUsers: admins,
            premiumUsers: premiums,
            activeUsers: total - banned
        };
    }

    async updateUserRole(targetUserId: string, role: UserRole) {
        return this.userModel.findByIdAndUpdate(
            targetUserId,
            { role },
            { new: true }
        ).select('-passwordHash').exec();
    }

    async toggleBanUser(targetUserId: string) {
        const user = await this.userModel.findById(targetUserId);
        if (!user) throw new BadRequestException('Користувача не знайдено');

        user.isBanned = !user.isBanned;
        await user.save();
        return { id: user._id, isBanned: user.isBanned };
    }
}