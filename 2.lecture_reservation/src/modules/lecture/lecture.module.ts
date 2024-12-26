import { Module } from '@nestjs/common';
import { LectureController } from './lecture.controller';
import { LectureFacadeService } from './service/lecture.facade.service';
import { CommonModule } from '../../common/common.moduel';
import { LecturePrismaRepository } from './repository/lecture.prisma.repository';
import { LECTURE_REPOSITORY } from './repository/lecture.repository.interface';
import { ReservationModule } from '../reservation/reservation.module';
import { PrismaService } from '../../common/prisma.service';
import { LectureService } from './service/lecture.service';

@Module({
    controllers: [LectureController],
    providers: [
        LectureFacadeService,
        {
            provide: LECTURE_REPOSITORY,
            useClass: LecturePrismaRepository,
        },
        PrismaService,
        LectureService,
    ],
    imports: [CommonModule, ReservationModule],
})
export class LectureModule {}
