import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(2, { message: "Ім'я повинно містити мінімум 2 символи" })
    name: string;

    @IsEmail({}, { message: 'Некоректний формат email' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Пароль повинен містити мінімум 6 символів' })
    password: string;
}