import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ProfanityInterceptor implements NestInterceptor {
    // Наш словник
    private badWords = [
        'бля', 'блять', 'блядь', 'сука', 'суки', 'курва', 'хуй', 'піздець',
        'пиздец', 'єбать', 'ебать', 'мудак', 'гавно', 'дерьмо', 'гівно', 'хер', 'хєр'
    ];

    // Створюємо регулярний вираз, який шукає ці слова незалежно від регістру (прапорець 'i')
    private regex = new RegExp(`(${this.badWords.join('|')})`, 'gi');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // Якщо в запиті є дані (body), проганяємо їх через фільтр
        if (request.body) {
            this.cleanObject(request.body);
        }

        return next.handle();
    }

    // Рекурсивна функція, яка проходить по всіх текстових полях об'єкта
    private cleanObject(obj: any) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Замінюємо знайдені погані слова на ***
                obj[key] = obj[key].replace(this.regex, '***');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.cleanObject(obj[key]);
            }
        }
    }
}