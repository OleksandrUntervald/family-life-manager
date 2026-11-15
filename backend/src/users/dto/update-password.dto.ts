import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Введіть старий пароль' })
    oldPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'Введіть новий пароль' })
    @MinLength(6, { message: 'Новий пароль має бути не коротшим за 6 символів' })
    newPassword: string;
}