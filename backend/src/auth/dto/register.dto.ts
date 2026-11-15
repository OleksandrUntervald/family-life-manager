import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'Ім\'я обов\'язкове' })
    name: string;

    @IsEmail({}, { message: 'Некоректний email' })
    @IsNotEmpty({ message: 'Email обов\'язковий' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Пароль обов\'язковий' })
    @MinLength(6, { message: 'Пароль має містити щонайменше 6 символів' })
    password: string;
}