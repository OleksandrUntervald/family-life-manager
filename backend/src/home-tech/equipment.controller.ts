import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Patch,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EquipmentService } from './equipment.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import type { UploadedFileType } from '../common/interfaces/uploaded-file.interface.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('home-tech')
export class EquipmentController {
    constructor(private readonly equipmentService: EquipmentService) {}

    @Get()
    findAll(@GetUser() user: { id: string }) {
        return this.equipmentService.findAll(user.id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @GetUser() user: { id: string },
        @Body() dto: CreateEquipmentDto,
        @UploadedFile() file?: UploadedFileType,
    ) {
        return this.equipmentService.create(user.id, dto, file);
    }

    @Delete(':id')
    remove(
        @GetUser() user: { id: string },
        @Param('id', ParseObjectIdPipe) id: string,
    ) {
        return this.equipmentService.remove(user.id, id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @GetUser() user: { id: string },
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() dto: UpdateEquipmentDto,
        @UploadedFile() file?: UploadedFileType,
    ) {
        return this.equipmentService.update(user.id, id, dto, file);
    }
}