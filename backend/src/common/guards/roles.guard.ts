import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { UserRole } from '../../users/schemas/user.schema.js';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private usersService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId) return false;

        // Один запит до бази тут, замість дублювання в кожному контролері
        const user = await this.usersService.findById(userId);
        if (!user || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Доступ заборонено. Недостатньо прав.');
        }

        return true;
    }
}