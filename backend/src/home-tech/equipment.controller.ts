import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EquipmentService } from './equipment.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@UseGuards(JwtAuthGuard)
@Controller('home-tech')
export class EquipmentController {
    constructor(
        private readonly equipmentService: EquipmentService,
        private readonly cloudinaryService: CloudinaryService // <-- Підключили сервіс
    ) {}

    @Get()
    findAll(@Request() req: any) {
        return this.equipmentService.findAll(req.user.id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file')) // Чекаємо на файл
    async create(@Request() req: any, @Body() dto: any, @UploadedFile() file: any) {
        const equipmentData = { ...dto };

        // Якщо є файл, вантажимо його в окрему папку техніки
        if (file) {
            equipmentData.photoUrl = await this.cloudinaryService.uploadFile(file, 'lifemanager_equipment');
        }

        return this.equipmentService.create(req.user.id, equipmentData);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.equipmentService.remove(req.user.id, id);
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

        // Якщо при редагуванні закинули нове фото
        if (file) {
            updateData.photoUrl = await this.cloudinaryService.uploadFile(file, 'lifemanager_equipment');
        }

        return this.equipmentService.update(req.user.id, id, updateData);
    }
}