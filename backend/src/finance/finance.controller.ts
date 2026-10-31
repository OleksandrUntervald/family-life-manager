import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch, UseInterceptors, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { FinanceService } from './finance.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
    constructor(
        private readonly financeService: FinanceService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(@Request() req: any, @Body() dto: any, @UploadedFile() file: any) {
        let receiptUrl = '';

        if (file) {
            receiptUrl = await this.cloudinaryService.uploadFile(file, 'lifemanager_finance');
        }

        const transactionData = { ...dto, amount: Number(dto.amount) };
        if (receiptUrl) transactionData.receiptUrl = receiptUrl;

        return this.financeService.create(req.user.id, transactionData);
    }

    @Get('summary')
    getSummary(@Request() req: any) {
        return this.financeService.getSummary(req.user.id);
    }

    // ВИПРАВЛЕНО: Додано підтримку query-параметрів для пагінації та фільтрації
    @Get()
    findAll(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
        @Query('type') type?: string,
        @Query('category') category?: string
    ) {
        return this.financeService.findAll(
            req.user.id,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 10,
            sortBy || 'createdAt',
            sortOrder || 'desc',
            type,
            category
        );
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Некоректний ID');
        return this.financeService.remove(id, req.user.id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: any,
        @UploadedFile() file: any
    ) {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Некоректний ID');

        const updateData = { ...body };
        delete updateData.userId;

        if (updateData.amount) updateData.amount = Number(updateData.amount);

        if (file) {
            updateData.receiptUrl = await this.cloudinaryService.uploadFile(file, 'lifemanager_finance');
        }

        return this.financeService.updateTransaction(req.user.id, id, updateData);
    }
}