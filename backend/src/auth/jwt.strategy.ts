import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    tokenVersion?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') as string,
        });
    }

    async validate(payload: JwtPayload) {
        let user;
        try {
            user = await this.usersService.findById(payload.sub);
        } catch {
            throw new UnauthorizedException('Користувача не знайдено або сесія недійсна');
        }

        if (!user) {
            throw new UnauthorizedException('Користувача не знайдено');
        }

        if (user.isBanned) {
            throw new UnauthorizedException('Ваш акаунт заблоковано адміністратором');
        }

        const currentVersion = user.tokenVersion || 0;
        if (currentVersion !== (payload.tokenVersion || 0)) {
            throw new UnauthorizedException('Сесія застаріла. Будь ласка, увійдіть знову.');
        }

        return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
    }
}