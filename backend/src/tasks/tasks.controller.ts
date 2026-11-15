import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    create(
        @GetUser() user: { id: string },
        @Body() dto: CreateTaskDto,
    ) {
        return this.tasksService.create(user.id, dto);
    }

    @Get()
    findAll(
        @GetUser() user: { id: string },
        @Query('isShared') isShared?: string,
    ) {
        return this.tasksService.findAll(user.id, isShared === 'true');
    }

    @Delete(':id')
    remove(
        @GetUser() user: { id: string },
        @Param('id', ParseObjectIdPipe) id: string,
    ) {
        return this.tasksService.remove(id, user.id);
    }

    @Patch(':id/edit')
    updateTask(
        @GetUser() user: { id: string },
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.tasksService.updateTask(user.id, id, dto);
    }
}