import {
    ConflictException,
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from './schemas/user.schema.js';
import { ActivationKey } from './schemas/activation-key.schema.js';
import { RegisterDto } from '../auth/dto/register.dto.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 хвилин
const ACTIVATION_KEY_TTL_MS = 24 * 60 * 60 * 1000; // 24 години

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(ActivationKey.name) private activationKeyModel: Model<ActivationKey>,
    ) {}

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
                role: UserRole.SUPER_ADMIN,
            });
            console.log('✅ Дефолтного суперадміна успішно створено!');
        } else if (
            existingAdmin.role !== UserRole.ADMIN &&
            existingAdmin.role !== UserRole.SUPER_ADMIN
        ) {
            existingAdmin.role = UserRole.SUPER_ADMIN;
            existingAdmin.isBanned = false;
            await existingAdmin.save();
            console.log('🛡️ Права суперадміна (admin@gmail.com) автоматично відновлено!');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel
            .findOne({ email: email.trim().toLowerCase() })
            .select('+passwordHash')
            .exec();
    }

    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) throw new NotFoundException('Користувача не знайдено');
        return user;
    }

    async create(dto: RegisterDto): Promise<User> {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const existingUser = await this.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new ConflictException('Користувач з таким email вже існує');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);

        const newUser = new this.userModel({
            email: normalizedEmail,
            name: dto.name.trim(),
            passwordHash,
        });

        return newUser.save();
    }

    async updateSettings(userId: string, updateData: UpdateSettingsDto) {
        const updated = await this.userModel
            .findByIdAndUpdate(
                userId,
                { $set: updateData },
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

    async createPasswordResetToken(email: string): Promise<void> {
        const user = await this.findByEmail(email);
        if (!user) return;

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
        await user.save();

        console.log(`🔑 [Password Reset] Email: ${user.email} | Token: ${rawToken}`);
    }

    async resetPasswordWithToken(rawToken: string, newPass: string) {
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken.trim())
            .digest('hex');

        const user = await this.userModel
            .findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: new Date() },
            })
            .select('+passwordHash +resetPasswordToken +resetPasswordExpires')
            .exec();

        if (!user) {
            throw new BadRequestException(
                'Токен відновлення недійсний або термін його дії минув',
            );
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPass, salt);
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: 'Пароль успішно скинуто. Увійдіть з новим паролем.' };
    }

    async generateActivationKey(adminId: string) {
        const hex = crypto.randomBytes(8).toString('hex').toUpperCase();
        const code = `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
        const expiresAt = new Date(Date.now() + ACTIVATION_KEY_TTL_MS);

        await this.activationKeyModel.create({
            code,
            createdBy: new Types.ObjectId(adminId),
            expiresAt,
        });

        return { token: code, expiresAt, expiresIn: '24h' };
    }

    async activatePremiumKey(userId: string, key: string) {
        const normalizedKey = (key || '').trim().toUpperCase();
        const keyDoc = await this.activationKeyModel
            .findOne({
                code: normalizedKey,
                isUsed: false,
                expiresAt: { $gt: new Date() },
            })
            .exec();

        if (!keyDoc) {
            throw new BadRequestException(
                'Недійсний, прострочений або вже використаний ключ активації',
            );
        }

        const user = await this.findById(userId);
        keyDoc.isUsed = true;
        keyDoc.usedBy = new Types.ObjectId(userId);
        await keyDoc.save();

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
        const [total, banned, admins, premiums, activeKeysCount] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ isBanned: true }),
            this.userModel.countDocuments({
                role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
            }),
            this.userModel.countDocuments({ role: UserRole.PREMIUM }),
            this.activationKeyModel.countDocuments({
                isUsed: false,
                expiresAt: { $gt: new Date() },
            }),
        ]);

        return {
            totalUsers: total,
            bannedUsers: banned,
            adminUsers: admins,
            premiumUsers: premiums,
            activeUsers: total - banned,
            activeKeysCount,
        };
    }

    async updateUserRole(
        targetUserId: string,
        role: UserRole,
        actorId?: string,
        actorRole?: UserRole,
    ) {
        if (actorId && String(actorId) === String(targetUserId)) {
            throw new BadRequestException('Ви не можете змінити роль самому собі');
        }

        const targetUser = await this.userModel.findById(targetUserId);
        if (!targetUser) throw new NotFoundException('Користувача не знайдено');

        if (
            targetUser.email === 'admin@gmail.com' ||
            targetUser.role === UserRole.SUPER_ADMIN
        ) {
            throw new ForbiddenException('Неможливо змінити роль суперадміна');
        }

        if (
            targetUser.role === UserRole.ADMIN &&
            actorRole !== UserRole.SUPER_ADMIN
        ) {
            throw new ForbiddenException(
                'Адмін не може змінювати роль іншого адміністратора',
            );
        }

        if (role === UserRole.SUPER_ADMIN && actorRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Недостатньо прав для призначення SUPER_ADMIN');
        }

        targetUser.role = role;
        return targetUser.save();
    }

    async toggleBanUser(
        targetUserId: string,
        actorId?: string,
        actorRole?: UserRole,
    ) {
        if (actorId && String(actorId) === String(targetUserId)) {
            throw new BadRequestException('Ви не можете заблокувати самого себе');
        }

        const user = await this.userModel.findById(targetUserId);
        if (!user) throw new NotFoundException('Користувача не знайдено');

        if (
            user.email === 'admin@gmail.com' ||
            user.role === UserRole.SUPER_ADMIN
        ) {
            throw new ForbiddenException('Неможливо заблокувати суперадміна');
        }

        if (user.role === UserRole.ADMIN && actorRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException(
                'Адмін не може заблокувати іншого адміністратора',
            );
        }

        user.isBanned = !user.isBanned;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
        return { id: user._id, isBanned: user.isBanned };
    }
}