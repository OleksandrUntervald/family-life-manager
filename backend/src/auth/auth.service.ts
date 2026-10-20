import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    // Реєстрація
    async register(dto: RegisterDto) {
        const user = await this.usersService.create(dto);
        return this.generateToken(user._id.toString(), user.email, user.role);
    }

    // Логін
    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Невірний email або пароль');
        }

        // Порівнюємо пароль з хешем у базі
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Невірний email або пароль');
        }

        return this.generateToken(user._id.toString(), user.email, user.role);
    }

    // Генерація JWT
    private generateToken(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role }; // sub (subject) - стандартне поле для ID
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: userId, email, role },
        };
    }
}