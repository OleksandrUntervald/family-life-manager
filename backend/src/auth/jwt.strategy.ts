import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') as string,
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Користувача не знайдено');
        }

        if (user.isBanned) {
            throw new UnauthorizedException('Ваш акаунт заблоковано адміністратором');
        }

        // ВИПРАВЛЕНО: Якщо в базі старий запис без tokenVersion, вважаємо його нулем
        const currentVersion = user.tokenVersion || 0;
        if (currentVersion !== payload.tokenVersion) {
            throw new UnauthorizedException('Сесія застаріла. Будь ласка, увійдіть знову.');
        }

        return { id: user._id, email: user.email, role: user.role };
    }
}