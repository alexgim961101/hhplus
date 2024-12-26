import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { GlobalExceptionFilter } from './common/filter/global-exception.filter';
import { LectureModule } from './modules/lecture/lecture.module';
import { ReservationModule } from './modules/reservation/reservation.module';

@Module({
    imports: [LectureModule, ReservationModule],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {}
