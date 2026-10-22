import { Controller, Get, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserRole } from './schemas/user.schema.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // Отримання актуальних даних поточного юзера (разом із роллю)
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req: any) {
        return this.usersService.findById(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('settings')
    async updateSettings(@Request() req: any, @Body() body: any) {
        return this.usersService.updateSettings(req.user.id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(@Request() req: any, @Body('name') name: string) {
        return this.usersService.updateProfile(req.user.id, name);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('password')
    async updatePassword(@Request() req: any, @Body() body: any) {
        return this.usersService.updatePassword(req.user.id, body.oldPassword, body.newPassword);
    }

    // --- ЕНДПОІНТИ ДЛЯ АДМІНІСТРАТОРА ---

    @UseGuards(JwtAuthGuard)
    @Get('admin/all')
    async getAllUsers(@Request() req: any) {
        const currentUser = await this.usersService.findById(req.user.id);
        if (currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.SUPER_ADMIN && currentUser?.role !== UserRole.MANAGER) {
            throw new ForbiddenException('Доступ лише для адміністрації');
        }
        return this.usersService.findAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Patch('admin/:id/role')
    async changeRole(@Request() req: any, @Param('id') targetId: string, @Body('role') role: UserRole) {
        const currentUser = await this.usersService.findById(req.user.id);
        if (currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Тільки головний адмін може змінювати ролі');
        }
        return this.usersService.updateUserRole(targetId, role);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('admin/:id/ban')
    async toggleBan(@Request() req: any, @Param('id') targetId: string) {
        const currentUser = await this.usersService.findById(req.user.id);
        if (currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Тільки головний адмін може блокувати користувачів');
        }
        return this.usersService.toggleBanUser(targetId);
    }
}