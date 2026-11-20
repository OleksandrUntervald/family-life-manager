import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Patch,
    UseInterceptors,
    UploadedFile,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FinanceService } from './finance.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import type { UploadedFileType } from '../common/interfaces/uploaded-file.interface.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { FinanceQueryDto } from './dto/finance-query.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @GetUser() user: { id: string },
        @Body() dto: CreateTransactionDto,
        @UploadedFile() file?: UploadedFileType,
    ) {
        return this.financeService.create(user.id, dto, file);
    }

    @Get('summary')
    getSummary(
        @GetUser() user: { id: string },
        @Query('isShared') isShared?: string,
    ) {
        return this.financeService.getSummary(user.id, isShared === 'true');
    }

    @Get()
    findAll(
        @GetUser() user: { id: string },
        @Query() query: FinanceQueryDto,
    ) {
        return this.financeService.findAll(user.id, query);
    }

    @Delete(':id')
    remove(
        @GetUser() user: { id: string },
        @Param('id', ParseObjectIdPipe) id: string,
    ) {
        return this.financeService.remove(id, user.id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @GetUser() user: { id: string },
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() dto: UpdateTransactionDto,
        @UploadedFile() file?: UploadedFileType,
    ) {
        return this.financeService.updateTransaction(user.id, id, dto, file);
    }
}