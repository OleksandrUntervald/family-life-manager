import { IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema.js';

export class ChangeRoleDto {
    @IsEnum(UserRole, { message: 'Неприпустима роль користувача' })
    role: UserRole;
}