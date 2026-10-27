import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';
import { Transaction, TransactionSchema } from './schemas/transaction.schema.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js'; // <-- Додай це

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    CloudinaryModule, // <-- І додай сюди
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}