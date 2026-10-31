import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService // <-- Підключили сервіс юзерів
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') as string,
        });
    }

    async validate(payload: any) {
        // Звертаємося до бази, щоб отримати найсвіжіші дані юзера
        const user = await this.usersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Користувача не знайдено');
        }

        // ВИПРАВЛЕНО: Якщо користувач заблокований — відхиляємо будь-який запит
        if (user.isBanned) {
            throw new UnauthorizedException('Ваш акаунт заблоковано адміністратором');
        }

        return { id: user._id, email: user.email, role: user.role };
    }
}