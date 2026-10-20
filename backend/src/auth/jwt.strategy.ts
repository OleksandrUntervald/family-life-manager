import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') as string,
        });
    }

    // Цей метод викликається автоматично, якщо токен валідний
    async validate(payload: any) {
        // Повертаємо об'єкт, який NestJS автоматично покладе у request.user
        return { id: payload.sub, email: payload.email, role: payload.role };
    }
}