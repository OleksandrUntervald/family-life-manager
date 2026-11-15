import {
    ConflictException,
    Injectable,
    BadRequestException,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './schemas/user.schema.js';
import { RegisterDto } from '../auth/dto/register.dto.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Injectable()
export class UsersService implements OnModuleInit {
    private activeKeys = new Map<string, { createdBy: string; createdAt: Date }>();

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
        } else if (
            existingAdmin.role !== UserRole.ADMIN &&
            existingAdmin.role !== UserRole.SUPER_ADMIN
        ) {
            existingAdmin.role = UserRole.ADMIN;
            existingAdmin.isBanned = false;
            await existingAdmin.save();
            console.log('🛡️ Права суперадміна (admin@gmail.com) автоматично відновлено!');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('+passwordHash').exec();
    }

    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) throw new NotFoundException('Користувача не знайдено');
        return user;
    }

    async create(dto: RegisterDto): Promise<User> {
        const existingUser = await this.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('Користувач з таким email вже існує');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);

        const newUser = new this.userModel({
            email: dto.email.trim().toLowerCase(),
            name: dto.name.trim(),
            passwordHash,
        });

        return newUser.save();
    }

    async updateSettings(userId: string, updateData: UpdateSettingsDto) {
        const allowedFields = {
            ...(updateData.height !== undefined && { height: updateData.height }),
            ...(updateData.age !== undefined && { age: updateData.age }),
            ...(updateData.gender !== undefined && { gender: updateData.gender }),
            ...(updateData.targetWeight !== undefined && {
                targetWeight: updateData.targetWeight,
            }),
        };

        const updated = await this.userModel
            .findByIdAndUpdate(
                userId,
                { $set: allowedFields },
                { new: true, runValidators: true },
            )
            .exec();

        if (!updated) throw new NotFoundException('Користувача не знайдено');
        return updated;
    }

    async updateProfile(userId: string, name: string) {
        const updated = await this.userModel
            .findByIdAndUpdate(
                userId,
                { $set: { name: name.trim() } },
                { new: true, runValidators: true },
            )
            .exec();

        if (!updated) throw new NotFoundException('Користувача не знайдено');
        return updated;
    }

    async updatePassword(userId: string, oldPass: string, newPass: string) {
        const user = await this.userModel.findById(userId).select('+passwordHash');
        if (!user) throw new NotFoundException('Користувача не знайдено');

        const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
        if (!isMatch) {
            throw new BadRequestException('Невірний старий пароль');
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPass, salt);
        user.tokenVersion = (user.tokenVersion || 0) + 1;

        await user.save();

        return { message: 'Пароль успішно змінено' };
    }

    async resetPasswordByEmail(email: string, newPass: string) {
        const user = await this.findByEmail(email.trim().toLowerCase());
        if (!user) {
            throw new NotFoundException('Користувача з таким email не знайдено');
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPass, salt);
        user.tokenVersion = (user.tokenVersion || 0) + 1;

        await user.save();
        return { message: 'Пароль успішно скинуто. Увійдіть з новим паролем.' };
    }

    async generateActivationKey(adminId: string) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) token += '-';
            token += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        this.activeKeys.set(token, { createdBy: adminId, createdAt: new Date() });
        return { token, expiresIn: '24h' };
    }

    async activatePremiumKey(userId: string, key: string) {
        const normalizedKey = (key || '').trim().toUpperCase();
        if (!this.activeKeys.has(normalizedKey)) {
            throw new BadRequestException('Недійсний або вже використаний ключ активації');
        }

        const user = await this.findById(userId);
        this.activeKeys.delete(normalizedKey);

        if (user.role === UserRole.USER) {
            user.role = UserRole.PREMIUM;
            await user.save();
        }

        return {
            message: 'Premium-доступ успішно активовано!',
            role: user.role,
        };
    }

    // --- АДМІНСЬКІ МЕТОДИ ---

    async findAllUsers() {
        return this.userModel.find().sort({ createdAt: -1 }).exec();
    }

    async getPlatformStats() {
        const [total, banned, admins, premiums] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ isBanned: true }),
            this.userModel.countDocuments({
                role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
            }),
            this.userModel.countDocuments({ role: UserRole.PREMIUM }),
        ]);

        return {
            totalUsers: total,
            bannedUsers: banned,
            adminUsers: admins,
            premiumUsers: premiums,
            activeUsers: total - banned,
        };
    }

    async updateUserRole(targetUserId: string, role: UserRole, actorId?: string) {
        if (actorId && String(actorId) === String(targetUserId)) {
            throw new BadRequestException('Ви не можете змінити роль самому собі');
        }

        const targetUser = await this.userModel.findById(targetUserId);
        if (!targetUser) throw new NotFoundException('Користувача не знайдено');

        if (targetUser.email === 'admin@gmail.com') {
            throw new BadRequestException('Неможливо змінити роль головного суперадміна');
        }

        targetUser.role = role;
        return targetUser.save();
    }

    async toggleBanUser(targetUserId: string, actorId?: string) {
        if (actorId && String(actorId) === String(targetUserId)) {
            throw new BadRequestException('Ви не можете заблокувати самого себе');
        }

        const user = await this.userModel.findById(targetUserId);
        if (!user) throw new NotFoundException('Користувача не знайдено');

        if (user.email === 'admin@gmail.com') {
            throw new BadRequestException('Неможливо заблокувати головного суперадміна');
        }

        user.isBanned = !user.isBanned;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
        return { id: user._id, isBanned: user.isBanned };
    }
}