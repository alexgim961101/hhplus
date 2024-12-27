import { Test } from '@nestjs/testing';

import { TestingModule } from '@nestjs/testing';
import { ReservationController } from '../reservation.controller';
import { ReservationService } from '../reservation.service';
import { RESERVATION_REPOSITORY } from '../repository/reservation.repository.interface';
import { PrismaService } from '../../../common/prisma.service';
import { ReservationPrismaRepository } from '../repository/reservation.prisma.repository';

describe('ReservationIntegrationTest', () => {
    let controller: ReservationController;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReservationController],
            providers: [
                ReservationService,
                PrismaService,
                {
                    provide: RESERVATION_REPOSITORY,
                    useClass: ReservationPrismaRepository,
                },
            ],
        }).compile();

        controller = module.get<ReservationController>(ReservationController);
        prismaService = module.get<PrismaService>(PrismaService);

        // DB 초기화
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
        await prismaService.$executeRaw`TRUNCATE TABLE reservations`;
        await prismaService.$executeRaw`TRUNCATE TABLE lectures`;
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
    });

    afterEach(async () => {
        await prismaService.reservation.deleteMany();
        await prismaService.lecture.deleteMany();
    });

    describe('getReservationListByUserId', () => {
        it('유저 아이디를 기준으로 특강 신청 목록을 조회한다.', async () => {
            // given
            const userId = 1n;
            const mockLectures = [
                { title: 'Lecture 1', maxAttendees: 10, instructorId: 1n },
                { title: 'Lecture 2', maxAttendees: 10, instructorId: 1n },
                { title: 'Lecture 3', maxAttendees: 10, instructorId: 1n },
                { title: 'Lecture 4', maxAttendees: 10, instructorId: 1n },
            ];
            const mockReservations = [
                {
                    userId: userId,
                    lectureId: 1n,
                },
                {
                    userId: 2n,
                    lectureId: 2n,
                },
                {
                    userId: userId,
                    lectureId: 3n,
                },
                {
                    userId: 4n,
                    lectureId: 4n,
                },
            ];

            await prismaService.lecture.createMany({
                data: mockLectures.map((lecture) => ({
                    ...lecture,
                    dateTime: new Date(),
                    applicationStart: new Date(),
                    applicationEnd: new Date(),
                })),
            });
            await prismaService.reservation.createMany({
                data: mockReservations,
            });

            // when
            const result = await controller.getReservationList(Number(userId));

            // then
            expect(result.data).toHaveLength(2);
        });

        it('다른 유저의 특강 신청 목록은 조회되지 않는다.', async () => {
            // given
            const userId = 1n;
            const otherUserId = 2n;
            const mockLectures = [
                { title: 'Lecture 1', maxAttendees: 10, instructorId: 1n },
                { title: 'Lecture 2', maxAttendees: 10, instructorId: 1n },
            ];

            // 강의 생성 및 ID 가져오기
            const createdLectures = await Promise.all(
                mockLectures.map((lecture) =>
                    prismaService.lecture.create({
                        data: {
                            ...lecture,
                            dateTime: new Date(),
                            applicationStart: new Date(),
                            applicationEnd: new Date(),
                        },
                    }),
                ),
            );

            const mockReservations = [
                {
                    userId: userId,
                    lectureId: createdLectures[0].id,
                },
                {
                    userId: otherUserId,
                    lectureId: createdLectures[1].id,
                },
            ];

            await prismaService.reservation.createMany({
                data: mockReservations,
            });

            // when
            const result = await controller.getReservationList(Number(userId));

            // then
            expect(result.data).toHaveLength(1);
            expect(result.data[0].lectureId).toBe(createdLectures[0].id);
            expect(result.data[0].userId).toBe(userId);
        });
    });
});
