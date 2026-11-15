import { Controller, Get, Patch, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserRole } from './schemas/user.schema.js';

// ВИПРАВЛЕНО: Прибрано пробіли у шляхах до папки dto

import { GetUser } from '../common/decorators/get-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import {UpdatePasswordDto} from "./dto/update-password.dto.js";
import {UpdateProfileDto} from "./dto/update-profile.dto.js";
import {UpdateSettingsDto} from "./dto/update-settings.dto.js";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@GetUser() user: { id: string }) {
        return this.usersService.findById(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('settings')
    async updateSettings(@GetUser() user: { id: string }, @Body() body: UpdateSettingsDto) {
        return this.usersService.updateSettings(user.id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(@GetUser() user: { id: string }, @Body() body: UpdateProfileDto) {
        return this.usersService.updateProfile(user.id, body.name);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('password')
    async updatePassword(@GetUser() user: { id: string }, @Body() body: UpdatePasswordDto) {
        return this.usersService.updatePassword(user.id, body.oldPassword, body.newPassword);
    }

    // --- АДМІНСЬКА ЧАСТИНА ---

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @Get('admin/all')
    async getAllUsers() {
        return this.usersService.findAllUsers();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @Get('admin/stats')
    async getAdminStats() {
        return this.usersService.getPlatformStats();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch('admin/:id/role')
    async changeRole(@GetUser() user: { id: string }, @Param('id') targetId: string, @Body('role') role: UserRole) {
        if (!Types.ObjectId.isValid(targetId)) throw new BadRequestException('Некоректний ID');
        if (!Object.values(UserRole).includes(role)) throw new BadRequestException('Неприпустима роль');

        if (user.id === targetId) {
            throw new BadRequestException('Ви не можете змінити роль самому собі');
        }

        return this.usersService.updateUserRole(targetId, role);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch('admin/:id/ban')
    async toggleBan(@Param('id') targetId: string) {
        if (!Types.ObjectId.isValid(targetId)) throw new BadRequestException('Некоректний ID');
        return this.usersService.toggleBanUser(targetId);
    }
}