import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
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

    @Patch(':id/toggle')
    toggleComplete(@Request() req: any, @Param('id') id: string) {
        return this.tasksService.toggleComplete(id, req.user.id);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.tasksService.remove(id, req.user.id);
    }
}