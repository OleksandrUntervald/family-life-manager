import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { User, UserSchema } from './schemas/user.schema.js';

@Module({
  imports: [
    // Реєструємо схему в поточному модулі
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule], // Експортуємо сервіс для AuthModule
})
export class UsersModule {}