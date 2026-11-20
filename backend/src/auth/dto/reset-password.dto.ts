import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Токен відновлення обов’язковий' })
    token: string;

    @IsString()
    @MinLength(6, { message: 'Новий пароль має містити щонайменше 6 символів' })
    newPassword: string;
}