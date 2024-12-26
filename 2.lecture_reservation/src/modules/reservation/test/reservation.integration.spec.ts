import { Test } from "@nestjs/testing";

import { TestingModule } from "@nestjs/testing";
import { ReservationController } from "../reservation.controller";
import { ReservationService } from "../reservation.service";
import { RESERVATION_REPOSITORY } from "../repository/reservation.repository.interface";
import { PrismaService } from "../../../common/prisma.service";
import { ReservationPrismaRepository } from "../repository/reservation.prisma.repository";
import { BadRequestException } from "@nestjs/common";

describe('ReservationIntegrationTest', () => {
    let controller: ReservationController;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReservationController],
            providers: [ReservationService, PrismaService, {
                provide: RESERVATION_REPOSITORY,
                useClass: ReservationPrismaRepository,
            }]
        }).compile();

        controller = module.get<ReservationController>(ReservationController);
        prismaService = module.get<PrismaService>(PrismaService);

        // DB 초기화
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
        await prismaService.$executeRaw`TRUNCATE TABLE reservations`;
        await prismaService.$executeRaw`TRUNCATE TABLE lectures`;
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
    })

    describe('getReservationListByUserId', () => {
        it('유저 아이디를 기준으로 특강 신청 목록을 조회한다.', async () => {
            // given
            const userId = 1;
            const mockLectures = [
                { id: 1, title: 'Lecture 1', maxAttendees: 10, instructorId: 1 },
                { id: 2, title: 'Lecture 2', maxAttendees: 10, instructorId: 1 },
                { id: 3, title: 'Lecture 3', maxAttendees: 10, instructorId: 1 },
                { id: 4, title: 'Lecture 4', maxAttendees: 10, instructorId: 1 },
            ];
            const mockReservations = [
                {
                    id: 1,
                    userId: userId,
                    lectureId: 1,
                },
                {
                    id: 2,
                    userId: 2,
                    lectureId: 2,
                },
                {
                    id: 3,
                    userId: userId,
                    lectureId: 3,
                },
                {
                    id: 4,
                    userId: 4,
                    lectureId: 4,
                },
            ]

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
            const result = await controller.getReservationList(userId);

            // then
            expect(result.data).toHaveLength(2);
        })

        it('다른 유저의 특강 신청 목록은 조회되지 않는다.', async () => {
            // given
            const userId = 1n;
            const otherUserId = 2n;
            const mockLectures = [
                { id: 1, title: 'Lecture 1', maxAttendees: 10, instructorId: 1 },
                { id: 2, title: 'Lecture 2', maxAttendees: 10, instructorId: 1 },
            ];
            const mockReservations = [
                {
                    id: 1,
                    userId: userId,
                    lectureId: 1,
                },
                {
                    id: 2,
                    userId: otherUserId,
                    lectureId: 2,
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
            expect(result.data).toHaveLength(1);
            expect(result.data[0].lectureId).toBe(1n);
            expect(result.data[0].userId).toBe(userId);
        })
    })
})