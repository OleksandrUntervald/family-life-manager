import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { WorkoutsModule } from './workouts/workouts.module.js';
import { FinanceModule } from './finance/finance.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { HealthModule } from './health/health.module.js';
import { EquipmentModule } from './home-tech/equipment.module.js';
import { PremiumRequestsModule } from './premium-requests/premium-requests.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    UsersModule,
    AuthModule,
    WorkoutsModule,
    FinanceModule,
    TasksModule,
    HealthModule,
    EquipmentModule,
    PremiumRequestsModule, // <-- Підключили новий модуль
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}