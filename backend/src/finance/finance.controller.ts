import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FinanceService } from './finance.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
    constructor(
        private readonly financeService: FinanceService,
        private readonly cloudinaryService: CloudinaryService // Підключили Cloudinary
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('file')) // Чекаємо на файл з іменем 'file'
    async create(@Request() req: any, @Body() dto: any, @UploadedFile() file: any) {
        let receiptUrl = '';

        // Якщо користувач прикріпив файл — вантажимо в хмару
        if (file) {
            receiptUrl = await this.cloudinaryService.uploadFile(file, 'lifemanager_finance');
        }

        // Перетворюємо суму на число (бо з FormData вона приходить як рядок)
        const transactionData = { ...dto, amount: Number(dto.amount) };
        if (receiptUrl) transactionData.receiptUrl = receiptUrl;

        return this.financeService.create(req.user.id, transactionData);
    }

    @Get('summary')
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
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: any,
        @UploadedFile() file: any
    ) {
        const updateData = { ...body };
        if (updateData.amount) updateData.amount = Number(updateData.amount);

        // Якщо при редагуванні додали нове фото
        if (file) {
            updateData.receiptUrl = await this.cloudinaryService.uploadFile(file, 'lifemanager_finance');
        }

        return this.financeService.updateTransaction(req.user.id, id, updateData);
    }
}