import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';
import { Task, TaskSchema } from './schemas/task.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema } // <-- Додали
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}