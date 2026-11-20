import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Family } from './schemas/family.schema.js';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class FamiliesService {
    constructor(
        @InjectModel(Family.name) private familyModel: Model<Family>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    private generateInviteCode(): string {
        const buf = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${buf.slice(0, 4)}-${buf.slice(4, 8)}`;
    }

    async createFamily(userId: string, name: string) {
        if (!name || name.trim() === '') {
            throw new BadRequestException('Назва родини не може бути порожньою');
        }

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('Користувача не знайдено');

        if (user.familyId) {
            throw new BadRequestException('Ви вже перебуваєте в родині. Спочатку вийдіть з неї.');
        }

        let inviteCode = this.generateInviteCode();
        while (await this.familyModel.findOne({ inviteCode })) {
            inviteCode = this.generateInviteCode();
        }

        const newFamily = new this.familyModel({
            name: name.trim(),
            inviteCode,
            ownerId: userId,
            members: [userId],
        });

        const savedFamily = await newFamily.save();

        user.familyId = savedFamily._id as Types.ObjectId;
        await user.save();

        return savedFamily;
    }

    async joinFamily(userId: string, inviteCode: string) {
        if (!inviteCode || inviteCode.trim() === '') {
            throw new BadRequestException('Код запрошення не може бути порожнім');
        }

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('Користувача не знайдено');

        if (user.familyId) {
            throw new BadRequestException('Ви вже перебуваєте в родині.');
        }

        const family = await this.familyModel.findOne({
            inviteCode: inviteCode.trim().toUpperCase(),
        });
        if (!family) {
            throw new NotFoundException('Родину за таким кодом не знайдено');
        }

        family.members.push(new Types.ObjectId(userId));
        await family.save();

        user.familyId = family._id as Types.ObjectId;
        await user.save();

        return family;
    }

    async getMyFamily(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('Користувача не знайдено');

        if (!user.familyId) {
            return null;
        }

        return this.familyModel
            .findById(user.familyId)
            .populate('members', 'name email role')
            .populate('ownerId', 'name email')
            .exec();
    }

    async leaveFamily(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('Користувача не знайдено');

        if (!user.familyId) {
            throw new BadRequestException('Ви не перебуваєте в жодній родині');
        }

        const family = await this.familyModel.findById(user.familyId);
        if (family) {
            family.members = family.members.filter((id) => id.toString() !== userId);

            if (family.members.length === 0) {
                await this.familyModel.findByIdAndDelete(family._id);
            } else if (family.ownerId.toString() === userId) {
                family.ownerId = family.members[0];
                await family.save();
            } else {
                await family.save();
            }
        }

        user.familyId = null as any;
        await user.save();

        return { message: 'Ви успішно покинули родину' };
    }
}