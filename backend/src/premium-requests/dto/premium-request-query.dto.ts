import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PremiumRequestQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'page має бути цілим числом' })
    @Min(1, { message: 'page має бути не менше 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'limit має бути цілим числом' })
    @Min(1, { message: 'limit має бути не менше 1' })
    @Max(100, { message: 'limit не може перевищувати 100' })
    limit?: number = 25;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    search?: string;
}