import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';
import { Transaction, TransactionSchema } from './schemas/transaction.schema.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { User, UserSchema } from '../users/schemas/user.schema.js'; // <-- Додали

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema } // <-- Додали
    ]),
    CloudinaryModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}