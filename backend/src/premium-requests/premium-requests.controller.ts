import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { PremiumRequestsService } from './premium-requests.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UsersService } from '../users/users.service.js';
import { UserRole } from '../users/schemas/user.schema.js';

@Controller('premium-requests')
export class PremiumRequestsController {
    constructor(
        private readonly requestsService: PremiumRequestsService,
        private readonly usersService: UsersService,
    ) {}

    // Користувач залишає заявку на Преміум (вводить свій Telegram)
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Request() req: any,
        @Body('telegram') telegram: string,
        @Body('plan') plan?: string,
        @Body('comment') comment?: string,
    ) {
        return this.requestsService.createRequest(req.user.id, telegram, plan, comment);
    }

    // Отримання таблиці заявок з пагінацією (для Адміна та Менеджера)
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(
        @Request() req: any,
        @Query('page') page = 1,
        @Query('limit') limit = 25,
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        const user = await this.usersService.findById(req.user.id);
        if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.MANAGER) {
            throw new ForbiddenException('Доступ лише для адміністратора або менеджера');
        }
        return this.requestsService.findAllPaginated(Number(page), Number(limit), status, search);
    }

    // Редагування заявки (зміна статусу, суми, коментаря)
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        const user = await this.usersService.findById(req.user.id);
        if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.MANAGER) {
            throw new ForbiddenException('Доступ заборонено');
        }
        return this.requestsService.updateRequest(id, body, user.name);
    }

    // Кнопка "Заповнити базу тестовим дампом (105 заявок)"
    @UseGuards(JwtAuthGuard)
    @Post('seed')
    async seed(@Request() req: any) {
        const user = await this.usersService.findById(req.user.id);
        if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Тільки адмін може генерувати дамп');
        }
        return this.requestsService.seedMockData();
    }
}