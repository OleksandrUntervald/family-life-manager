import {Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch} from '@nestjs/common';
import { EquipmentService } from './equipment.service.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('home-tech')
export class EquipmentController {
    constructor(private readonly equipmentService: EquipmentService) {}

    @Get()
    findAll(@Request() req: any) {
        return this.equipmentService.findAll(req.user.id);
    }

    @Post()
    create(@Request() req: any, @Body() dto: CreateEquipmentDto) {
        return this.equipmentService.create(req.user.id, dto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.equipmentService.remove(req.user.id, id);
    }

    @Patch(':id')
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: any
    ) {
        return this.equipmentService.update(req.user.id, id, body);
    }
}