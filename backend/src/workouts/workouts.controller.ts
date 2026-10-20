import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WorkoutsService } from './workouts.service.js';
import { CreateWorkoutDto } from './dto/create-workout.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard) // Захищаємо всі маршрути одразу
@Controller('workouts') // Базовий шлях: /api/workouts
export class WorkoutsController {
    constructor(private readonly workoutsService: WorkoutsService) {}

    @Post()
    create(@Request() req: any, @Body() dto: CreateWorkoutDto) {
        // req.user.id береться з токена завдяки JwtAuthGuard
        return this.workoutsService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.workoutsService.findAll(req.user.id);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.workoutsService.remove(id, req.user.id);
    }
}