import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';
import { Response } from 'express';

@Catch(MongooseError.ValidationError, MongooseError.CastError)
export class MongooseExceptionFilter implements ExceptionFilter {
    catch(exception: MongooseError.ValidationError | MongooseError.CastError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let message = 'Помилка бази даних';

        if (exception instanceof MongooseError.ValidationError) {
            const messages = Object.values(exception.errors).map(err => err.message);
            message = messages.join(', ');
        } else if (exception instanceof MongooseError.CastError) {
            message = `Некоректний формат ID: ${exception.value}`;
        }

        response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message,
            error: 'Bad Request',
        });
    }
}