import { ExecutionContext, Injectable, Logger, NestInterceptor, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const now = Date.now();
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;

        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;
                const executionTime = Date.now() - now;
                this.logger.log(
                    `[${method}] ${url} ${statusCode} \x1b[33m+${executionTime}ms\x1b[0m`,
                );
            }),
        );
    }
}
