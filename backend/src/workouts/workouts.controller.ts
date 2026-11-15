import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service.js';
import { CreateWorkoutDto } from './dto/create-workout.dto.js';
import { UpdateWorkoutDto } from './dto/update-workout.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
    constructor(private readonly workoutsService: WorkoutsService) {}

    @Post()
    create(
        @GetUser() user: { id: string },
        @Body() dto: CreateWorkoutDto,
    ) {
        return this.workoutsService.create(user.id, dto);
    }

    @Get()
    findAll(@GetUser() user: { id: string }) {
        return this.workoutsService.findAll(user.id);
    }

    @Delete(':id')
    remove(
        @GetUser() user: { id: string },
        @Param('id', ParseObjectIdPipe) id: string,
    ) {
        return this.workoutsService.remove(id, user.id);
    }

    @Patch(':id')
    updateWorkout(
        @GetUser() user: { id: string },
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() dto: UpdateWorkoutDto,
    ) {
        return this.workoutsService.updateWorkout(user.id, id, dto);
    }
}