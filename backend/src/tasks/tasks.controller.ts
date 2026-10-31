import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    create(@Request() req: any, @Body() dto: CreateTaskDto) {
        return this.tasksService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.tasksService.findAll(req.user.id);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Некоректний ID');
        return this.tasksService.remove(id, req.user.id);
    }

    @Patch(':id/edit')
    updateTask(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: any // Приймаємо всі оновлення (status, title, notes, assignedTo)
    ) {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Некоректний ID');
        return this.tasksService.updateTask(req.user.id, id, body);
    }
}