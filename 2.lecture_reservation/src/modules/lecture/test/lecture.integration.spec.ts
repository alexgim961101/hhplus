import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing';
import { LectureController } from '../lecture.controller';
import { LectureFacadeService } from '../service/lecture.facade.service';
import { PrismaService } from '../../../common/prisma.service';
import { ReservationService } from '../../reservation/reservation.service';
import { LectureService } from '../service/lecture.service';
import { LECTURE_REPOSITORY } from '../repository/lecture.repository.interface';
import { LecturePrismaRepository } from '../repository/lecture.prisma.repository';
import { RESERVATION_REPOSITORY } from '../../reservation/repository/reservation.repository.interface';
import { ReservationPrismaRepository } from '../../reservation/repository/reservation.prisma.repository';
import { ReservationModule } from '../../reservation/reservation.module';
import { CommonModule } from '../../../common/common.moduel';

describe('LectureIntegrationSpec', () => {
    let controller: LectureController;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LectureController],
            providers: [
                LectureFacadeService,
                LectureService,
                PrismaService,
                ReservationService,
                {
                    provide: LECTURE_REPOSITORY,
                    useClass: LecturePrismaRepository,
                },
                {
                    provide: RESERVATION_REPOSITORY,
                    useClass: ReservationPrismaRepository,
                },
            ],
            imports: [CommonModule, ReservationModule],
        }).compile();

        controller = module.get<LectureController>(LectureController);
        prismaService = module.get<PrismaService>(PrismaService);

        // DB 초기화
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
        await prismaService.$executeRaw`TRUNCATE TABLE reservations`;
        await prismaService.$executeRaw`TRUNCATE TABLE lectures`;
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
    });

    describe('getAvailableLectures', () => {
        it('특강 신청 가능 목록 조회 - 오늘 날짜를 포함하는 특강 조회', async () => {
            const userId = 1;
            const mockDate = new Date();
            const lectures = [
                {
                    instructorId: 1n,
                    title: 'Available Lecture1',
                    applicationStart: new Date(mockDate.getTime() - 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                    dateTime: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                    isAvailable: true,
                },
                {
                    instructorId: 2n,
                    title: 'Available Lecture2',
                    applicationStart: new Date(mockDate.getTime() - 1000 * 60 * 60 * 24 * 2),
                    applicationEnd: new Date(mockDate.getTime() - 1000 * 60 * 60 * 24),
                    dateTime: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                    isAvailable: true,
                },
                {
                    instructorId: 3n,
                    title: 'Available Lecture3',
                    applicationStart: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24 * 2),
                    dateTime: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24 * 4),
                    isAvailable: true,
                },
            ];

            await prismaService.lecture.createMany({
                data: lectures,
            });

            // when
            const result = await controller.getAvailableLectures(userId);

            // then
            expect(result.data).toHaveLength(1);
            expect(result.data[0].title).toBe('Available Lecture1');
        });

        it('특강 신청 가능하나 이미 내가 특강에 신청해둔 경우에는 조회 결과에 포함되지 않음', async () => {
            // given
            const userId = 1;
            const mockDate = new Date();
            const lectures = [
                {
                    id: 1n,
                    instructorId: 1n,
                    title: 'Available Lecture1',
                    applicationStart: new Date(mockDate.getTime() - 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                    dateTime: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                    isAvailable: true,
                },
            ];
            await prismaService.lecture.createMany({
                data: lectures,
            });
            await prismaService.reservation.create({
                data: {
                    userId,
                    lectureId: lectures[0].id,
                },
            });

            // when
            const result = await controller.getAvailableLectures(userId);

            // then
            expect(result.data).toHaveLength(0);
        });
    });
});
