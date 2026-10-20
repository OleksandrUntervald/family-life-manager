import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutsService } from './workouts.service.js';
import { WorkoutsController } from './workouts.controller.js';
import { Workout, WorkoutSchema } from './schemas/workout.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workout.name, schema: WorkoutSchema }]),
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
})
export class WorkoutsModule {}