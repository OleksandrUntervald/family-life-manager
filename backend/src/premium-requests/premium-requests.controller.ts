import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PremiumRequestsService } from './premium-requests.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UsersService } from '../users/users.service.js';
import { UserRole } from '../users/schemas/user.schema.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Controller('premium-requests')
export class PremiumRequestsController {
    constructor(
        private readonly requestsService: PremiumRequestsService,
        private readonly usersService: UsersService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @GetUser() user: { id: string },
        @Body('telegram') telegram: string,
        @Body('plan') plan?: string,
        @Body('comment') comment?: string,
    ) {
        return this.requestsService.createRequest(user.id, telegram, plan, comment);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @Get()
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 25,
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.requestsService.findAllPaginated(Number(page), Number(limit), status, search);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @Patch(':id')
    async update(@GetUser() user: { id: string }, @Param('id') id: string, @Body() body: any) {
        // Отримуємо повні дані юзера, щоб взяти його ім'я для фіксації менеджера, який схвалив
        const fullUser = await this.usersService.findById(user.id);
        const managerName = fullUser ? fullUser.name : 'Unknown';

        return this.requestsService.updateRequest(id, body, managerName, user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post('seed')
    async seed() {
        return this.requestsService.seedMockData();
    }
}