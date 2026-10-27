import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { PremiumRequest, RequestStatus } from './schemas/premium-request.schema.js';
import { UsersService } from '../users/users.service.js';
import { UserRole } from '../users/schemas/user.schema.js';

@Injectable()
export class PremiumRequestsService {
    constructor(
        @InjectModel(PremiumRequest.name) private requestModel: Model<PremiumRequest>,
        private usersService: UsersService,
        private configService: ConfigService, // Додали ConfigService для читання .env/docker
    ) {}

    // Відправка повідомлення в Telegram
    private async notifyTelegram(reqData: any, userEmail: string) {
        const token = this.configService.get('TELEGRAM_BOT_TOKEN');
        const chatId = this.configService.get('TELEGRAM_CHAT_ID');

        if (!token || !chatId || chatId === 'ВСТАВ_СЮДИ_СВІЙ_ID') return;

        const text = `🔥 <b>Нова заявка на Premium!</b>\n\n` +
            `👤 <b>Від:</b> ${reqData.name} (${userEmail})\n` +
            `✈️ <b>Telegram:</b> ${reqData.telegram}\n` +
            `📦 <b>Пакет:</b> ${reqData.plan}\n` +
            `💬 <b>Коментар:</b> ${reqData.comment || '—'}`;

        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML'
                })
            });
        } catch (err) {
            console.error('Помилка відправки в Telegram:', err);
        }
    }

    // Створення заявки від реального користувача
    async createRequest(userId: string, telegram: string, plan = 'Family Premium PRO', comment = '') {
        const user = await this.usersService.findById(userId);
        const newReq = new this.requestModel({
            userId,
            name: user ? user.name : 'Користувач',
            email: user ? user.email : 'unknown@gmail.com',
            telegram,
            plan,
            billingFormat: plan.includes('Annual') ? 'annual' : 'monthly',
            status: RequestStatus.NEW,
            sum: plan.includes('VIP') ? 199 : 99,
            alreadyPaid: 0,
            comment,
        });

        const savedReq = await newReq.save();

        // Відправляємо сповіщення у фоні (не блокуючи відповідь фронтенду)
        this.notifyTelegram(savedReq, user ? user.email : 'unknown').catch(console.error);

        return savedReq;
    }

    // Отримання заявок з пагінацією
    async findAllPaginated(page = 1, limit = 25, status?: string, search?: string) {
        const query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { telegram: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.requestModel
                .find(query)
                .sort({ createdAt: -1, _id: -1 }) // Від найновішої до найстарішої
                .skip(skip)
                .limit(limit)
                .exec(),
            this.requestModel.countDocuments(query).exec(),
        ]);

        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
    }

    // Оновлення заявки менеджером/адміном
    async updateRequest(id: string, updateData: any, managerName: string) {
        const updated = await this.requestModel.findByIdAndUpdate(
            id,
            { ...updateData, manager: managerName },
            { new: true },
        ).exec();

        // Якщо заявку схвалили і там прив'язаний реальний юзер — автоматично даємо йому PREMIUM
        if (updated && updated.status === RequestStatus.AGREE && updated.userId) {
            await this.usersService.updateUserRole(updated.userId.toString(), UserRole.PREMIUM);
        }

        return updated;
    }

    // Генератор тестового дампу
    async seedMockData() {
        const count = await this.requestModel.countDocuments();
        if (count >= 100) {
            return { message: 'База вже наповнена заявками', total: count };
        }

        const names = ['Олександр', 'Марія', 'Дмитро', 'Анна', 'Іван', 'Олена', 'Максим', 'Тетяна', 'Артем', 'Юлія', 'Богдан', 'Софія', 'Денис', 'Катерина', 'Андрій'];
        const surnames = ['Коваленко', 'Шевченко', 'Бондаренко', 'Ткаченко', 'Кравченко', 'Олійник', 'Лисенко', 'Марченко', 'Савченко', 'Руденко', 'Мороз', 'Петренко'];
        const plans = ['Family Premium PRO', 'Personal VIP', 'Family Minimal', 'Team Ultra'];
        const formats = ['annual', 'monthly'];
        const statuses = [RequestStatus.NEW, RequestStatus.IN_WORK, RequestStatus.AGREE, RequestStatus.DISAGREE, RequestStatus.DUBBING];
        const managers = [null, 'Super Admin', 'Manager_Oleg', 'Manager_Anna'];

        const mockRequests = [];

        for (let i = 1; i <= 105; i++) {
            const firstName = names[Math.floor(Math.random() * names.length)];
            const lastName = surnames[Math.floor(Math.random() * surnames.length)];
            const plan = plans[Math.floor(Math.random() * plans.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const sum = plan.includes('VIP') || plan.includes('Ultra') ? 199 : 99;
            const alreadyPaid = status === RequestStatus.AGREE ? sum : (status === RequestStatus.IN_WORK ? 50 : 0);

            mockRequests.push({
                name: `${firstName} ${lastName}`,
                email: `user${i}_${firstName.toLowerCase()}@gmail.com`,
                telegram: `@${firstName.toLowerCase()}_life_${100 + i}`,
                plan,
                billingFormat: formats[Math.floor(Math.random() * formats.length)],
                status,
                sum,
                alreadyPaid,
                manager: status === RequestStatus.NEW ? null : managers[Math.floor(Math.random() * managers.length)],
                comment: i % 4 === 0 ? 'Хочу підключити сімейний бюджет та Telegram-сповіщення' : '',
                createdAt: new Date(Date.now() - (105 - i) * 3600 * 1000 * 6), // Виправлений формат
            });
        }

        await this.requestModel.insertMany(mockRequests);
        return { message: 'Успішно згенеровано 105 тестових заявок!', total: await this.requestModel.countDocuments() };
    }
}