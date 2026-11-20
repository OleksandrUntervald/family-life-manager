import { Controller, Post, Get, Body, UseGuards, Delete } from '@nestjs/common';
import { FamiliesService } from './families.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('families')
export class FamiliesController {
    constructor(private readonly familiesService: FamiliesService) {}

    @Post('create')
    createFamily(
        @GetUser() user: { id: string },
        @Body('name') name: string,
    ) {
        return this.familiesService.createFamily(user.id, name);
    }

    @Post('join')
    joinFamily(
        @GetUser() user: { id: string },
        @Body('inviteCode') inviteCode: string,
    ) {
        return this.familiesService.joinFamily(user.id, inviteCode);
    }

    @Get('my')
    getMyFamily(@GetUser() user: { id: string }) {
        return this.familiesService.getMyFamily(user.id);
    }

    @Delete('leave')
    leaveFamily(@GetUser() user: { id: string }) {
        return this.familiesService.leaveFamily(user.id);
    }
}