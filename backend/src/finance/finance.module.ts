import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceService } from './finance.service.js';
import { FinanceController } from './finance.controller.js';
import { Transaction, TransactionSchema } from './schemas/transaction.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}