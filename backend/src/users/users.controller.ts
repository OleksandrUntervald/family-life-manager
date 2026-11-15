import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserRole } from './schemas/user.schema.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { UpdatePasswordDto } from './dto/update-password.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@GetUser() user: { id?: string; _id?: string }) {
        return this.usersService.findById(String(user.id || user._id));
    }

    @UseGuards(JwtAuthGuard)
    @Patch('settings')
    async updateSettings(
        @GetUser() user: { id?: string; _id?: string },
        @Body() body: UpdateSettingsDto,
    ) {
        return this.usersService.updateSettings(String(user.id || user._id), body);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(
        @GetUser() user: { id?: string; _id?: string },
        @Body() body: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(String(user.id || user._id), body.name);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('password')
    async updatePassword(
        @GetUser() user: { id?: string; _id?: string },
        @Body() body: UpdatePasswordDto,
    ) {
        return this.usersService.updatePassword(
            String(user.id || user._id),
            body.oldPassword,
            body.newPassword,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('activate-key')
    async activateKey(
        @GetUser() user: { id?: string; _id?: string },
        @Body('key') key: string,
    ) {
        return this.usersService.activatePremiumKey(String(user.id || user._id), key);
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
    @Post('admin/generate-key')
    async generateActivationKey(@GetUser() user: { id?: string; _id?: string }) {
        return this.usersService.generateActivationKey(String(user.id || user._id));
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch('admin/:id/role')
    async changeRole(
        @GetUser() user: { id?: string; _id?: string },
        @Param('id', ParseObjectIdPipe) targetId: string,
        @Body('role') role: UserRole,
    ) {
        if (!Object.values(UserRole).includes(role)) {
            throw new BadRequestException('Неприпустима роль');
        }

        return this.usersService.updateUserRole(
            targetId,
            role,
            String(user.id || user._id),
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch('admin/:id/ban')
    async toggleBan(
        @GetUser() user: { id?: string; _id?: string },
        @Param('id', ParseObjectIdPipe) targetId: string,
    ) {
        return this.usersService.toggleBanUser(
            targetId,
            String(user.id || user._id),
        );
    }
}