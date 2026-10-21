import {Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch} from '@nestjs/common';
import { FinanceService } from './finance.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) {}

    @Post()
    create(@Request() req: any, @Body() dto: CreateTransactionDto) {
        return this.financeService.create(req.user.id, dto);
    }

    @Get('summary') // Важливо: цей роут має бути ДО роута з ':id'
    getSummary(@Request() req: any) {
        return this.financeService.getSummary(req.user.id);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.financeService.findAll(req.user.id);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.financeService.remove(id, req.user.id);
    }

    @Patch(':id')
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: any
    ) {
        return this.financeService.updateTransaction(req.user.id, id, body);
    }
}