import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { CreateHealthDto } from './dto/create-health.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Post()
    upsert(@Request() req: any, @Body() dto: CreateHealthDto) {
        return this.healthService.upsert(req.user.id, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.healthService.findAll(req.user.id);
    }

    // Отримання повної розумної статистики на обрану дату
    @Get('stats/:date')
    getDailyStats(@Request() req: any, @Param('date') date: string) {
        return this.healthService.getDailyStats(req.user.id, date);
    }
}