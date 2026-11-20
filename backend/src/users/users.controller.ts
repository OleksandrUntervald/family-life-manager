import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
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
import { ChangeRoleDto } from './dto/change-role.dto.js';
import { ActivateKeyDto } from './dto/activate-key.dto.js';

interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@GetUser() user: AuthUser) {
        return this.usersService.findById(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('settings')
    async updateSettings(
        @GetUser() user: AuthUser,
        @Body() body: UpdateSettingsDto,
    ) {
        return this.usersService.updateSettings(user.id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(
        @GetUser() user: AuthUser,
        @Body() body: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(user.id, body.name);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('password')
    async updatePassword(
        @GetUser() user: AuthUser,
        @Body() body: UpdatePasswordDto,
    ) {
        return this.usersService.updatePassword(
            user.id,
            body.oldPassword,
            body.newPassword,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('activate-key')
    async activateKey(
        @GetUser() user: AuthUser,
        @Body() body: ActivateKeyDto,
    ) {
        return this.usersService.activatePremiumKey(user.id, body.key);
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
    async generateActivationKey(@GetUser() user: AuthUser) {
        return this.usersService.generateActivationKey(user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch('admin/:id/role')
    async changeRole(
        @GetUser() user: AuthUser,
        @Param('id', ParseObjectIdPipe) targetId: string,
        @Body() body: ChangeRoleDto,
    ) {
        return this.usersService.updateUserRole(
            targetId,
            body.role,
            user.id,
            user.role,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch('admin/:id/ban')
    async toggleBan(
        @GetUser() user: AuthUser,
        @Param('id', ParseObjectIdPipe) targetId: string,
    ) {
        return this.usersService.toggleBanUser(targetId, user.id, user.role);
    }
}