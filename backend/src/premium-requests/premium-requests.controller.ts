import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PremiumRequestsService } from './premium-requests.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserRole } from '../users/schemas/user.schema.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { CreatePremiumRequestDto } from './dto/create-premium-request.dto.js';
import { UpdatePremiumRequestDto } from './dto/update-premium-request.dto.js';
import { PremiumRequestQueryDto } from './dto/premium-request-query.dto.js';

@Controller('premium-requests')
export class PremiumRequestsController {
    constructor(private readonly requestsService: PremiumRequestsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @GetUser() user: { id: string },
        @Body() dto: CreatePremiumRequestDto,
    ) {
        return this.requestsService.createRequest(
            user.id,
            dto.telegram,
            dto.plan,
            dto.comment,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @Get()
    async findAll(@Query() query: PremiumRequestQueryDto) {
        return this.requestsService.findAllPaginated(
            query.page ?? 1,
            query.limit ?? 25,
            query.status,
            query.search,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @Patch(':id')
    async update(
        @GetUser() user: { id: string; email: string },
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() body: UpdatePremiumRequestDto,
    ) {
        return this.requestsService.updateRequest(id, body, user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post('seed')
    async seed() {
        return this.requestsService.seedMockData();
    }
}