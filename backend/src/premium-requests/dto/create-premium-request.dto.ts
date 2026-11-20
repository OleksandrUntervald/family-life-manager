import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePremiumRequestDto {
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'Telegram-контакт обов’язковий' })
    telegram: string;

    @IsOptional()
    @IsString()
    plan?: string;

    @IsOptional()
    @IsString()
    comment?: string;
}