import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsNotEmpty({ message: 'Ім\'я не може бути порожнім' })
    name: string;
}