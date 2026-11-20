import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateKeyDto {
    @IsString()
    @IsNotEmpty({ message: 'Ключ активації обов’язковий' })
    key: string;
}