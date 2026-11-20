import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { CreateHealthDto } from './dto/create-health.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { ParseDatePipe } from '../common/pipes/parse-date.pipe.js';

@UseGuards(JwtAuthGuard)
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Post()
    upsert(
        @GetUser() user: { id: string },
        @Body() dto: CreateHealthDto,
    ) {
        return this.healthService.upsert(user.id, dto);
    }

    @Get()
    findAll(@GetUser() user: { id: string }) {
        return this.healthService.findAll(user.id);
    }

    @Get('stats/:date')
    getDailyStats(
        @GetUser() user: { id: string },
        @Param('date', ParseDatePipe) date: string,
    ) {
        return this.healthService.getDailyStats(user.id, date);
    }
}