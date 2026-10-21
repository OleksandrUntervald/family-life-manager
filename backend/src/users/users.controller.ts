import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

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
}