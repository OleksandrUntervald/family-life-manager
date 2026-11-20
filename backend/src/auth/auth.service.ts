import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
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

    async register(dto: RegisterDto) {
        if (!dto.password || dto.password.length < 6) {
            throw new BadRequestException('Пароль має містити щонайменше 6 символів');
        }

        const user = await this.usersService.create(dto);
        return this.generateToken(
            user._id.toString(),
            user.email,
            user.role,
            user.tokenVersion || 0,
        );
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Невірний email або пароль');
        }

        if (user.isBanned) {
            throw new UnauthorizedException(
                'Ваш акаунт заблоковано адміністратором',
            );
        }

        const isPasswordValid = await bcrypt.compare(
            dto.password,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Невірний email або пароль');
        }

        return this.generateToken(
            user._id.toString(),
            user.email,
            user.role,
            user.tokenVersion || 0,
        );
    }

    async forgotPassword(email: string) {
        await this.usersService.createPasswordResetToken(email);
        return {
            message:
                'Якщо цей email зареєстровано, інструкції для скидання пароля надіслано.',
        };
    }

    async resetPassword(token: string, newPassword: string) {
        return this.usersService.resetPasswordWithToken(token, newPassword);
    }

    private generateToken(
        userId: string,
        email: string,
        role: string,
        tokenVersion: number,
    ) {
        const payload = { sub: userId, email, role, tokenVersion };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: userId, email, role },
        };
    }
}