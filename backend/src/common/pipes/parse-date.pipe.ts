import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class ParseDatePipe implements PipeTransform<string, string> {
    transform(value: string): string {
        if (!DATE_REGEX.test(value)) {
            throw new BadRequestException('Дата має бути у форматі YYYY-MM-DD');
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
            throw new BadRequestException('Вказано неіснуючу календарну дату');
        }
        return value;
    }
}