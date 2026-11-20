import { IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FinanceQueryDto {
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
    limit?: number = 10;

    @IsOptional()
    @IsIn(['createdAt', 'amount', 'title', 'category'], {
        message: 'Недопустиме поле для сортування',
    })
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';

    @IsOptional()
    @IsIn(['all', 'income', 'expense'])
    type?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isShared?: boolean = false;

    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateFrom має бути у форматі YYYY-MM-DD' })
    dateFrom?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateTo має бути у форматі YYYY-MM-DD' })
    dateTo?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minAmount?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxAmount?: number;
}