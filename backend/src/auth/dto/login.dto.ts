import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Некоректний email' })
    @IsNotEmpty({ message: 'Email обов\'язковий' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Пароль обов\'язковий' })
    password: string;
}