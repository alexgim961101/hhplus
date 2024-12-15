import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseResponseDto } from '../dto/base-response.dto';

export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
    
        const status = exception instanceof HttpException ? exception.getStatus() : 500;
        const message = exception.message;
    
        console.error(`[ExceptionHandler] ${request.method} ${request.url}:`, exception);
    
        response
            .status(status)
            .json(new BaseResponseDto(message, null));
    }
}