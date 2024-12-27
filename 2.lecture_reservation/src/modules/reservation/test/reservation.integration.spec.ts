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

    describe('createReservation', () => {
        it('하나의 특강에 대해 선착순을 초과할 경우 요청에 실패한다', async () => {
            // given
            const lectureId = 1n;
            const maxAttendees = 3;
            await prismaService.lecture.create({
                data: {
                    id: lectureId,
                    title: 'Test Lecture',
                    instructorId: 999n,
                    maxAttendees,
                    dateTime: new Date(),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60 * 24),
                },
            });

            // when & then
            await controller.createReservation(Number(lectureId), 1); // 성공
            await controller.createReservation(Number(lectureId), 2); // 성공
            await controller.createReservation(Number(lectureId), 3); // 성공
            await expect(controller.createReservation(Number(lectureId), 4)) // 실패
                .rejects.toThrow('No available seats');
        });

        it('여러 유저가 동시에 신청할 경우 maxAttendees만큼만 성공해야 한다', async () => {
            // given
            const lectureId = 1n;
            const maxAttendees = 30;
            const totalRequests = 40;

            await prismaService.lecture.create({
                data: {
                    id: lectureId,
                    title: 'Test Lecture',
                    instructorId: 999n,
                    maxAttendees,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60 * 24),
                },
            });

            // when
            const promises = Array.from({ length: totalRequests }, (_, i) =>
                controller
                    .createReservation(Number(lectureId), i + 1)
                    .then(() => 'success')
                    .catch(() => 'failure'),
            );

            const results = await Promise.all(promises);

            // then
            const successCount = results.filter((result) => result === 'success').length;
            const failureCount = results.filter((result) => result === 'failure').length;

            expect(successCount).toBe(maxAttendees);
            expect(failureCount).toBe(totalRequests - maxAttendees);

            const lecture = await prismaService.lecture.findUnique({
                where: { id: lectureId },
            });
            expect(lecture.currentAttendees).toBe(maxAttendees);
        });

        it('자기 자신이 만든 특강일 경우 참여할 수 없다', async () => {
            // given
            const instructorId = 1n;
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Test Lecture',
                    instructorId,
                    maxAttendees: 30,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60 * 24),
                },
            });

            // when & then
            await expect(
                controller.createReservation(Number(lecture.id), Number(instructorId)),
            ).rejects.toThrow('Cannot register for your own lecture');
        });

        it('신청 기간이 아닌 경우 예약할 수 없다', async () => {
            // given
            const userId = 1n;
            const mockDate = new Date();
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Test Lecture',
                    instructorId: 999n,
                    maxAttendees: 30,
                    dateTime: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24 * 4),
                    applicationStart: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24 * 2),
                },
            });

            // when & then
            await expect(
                controller.createReservation(Number(lecture.id), Number(userId)),
            ).rejects.toThrow('Registration period has not started yet');
        });

        it('존재하지 않는 강의에는 신청할 수 없다', async () => {
            // given
            const nonExistentLectureId = 999n;
            const userId = 1n;

            // when & then
            await expect(
                controller.createReservation(Number(nonExistentLectureId), Number(userId)),
            ).rejects.toThrow('Lecture not found');
        });

        it('isAvailable=false 인 강의에는 신청할 수 없다', async () => {
            // given
            const userId = 1n;
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Cancelled Lecture',
                    instructorId: 999n,
                    maxAttendees: 30,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    isAvailable: false,
                },
            });

            // when & then
            await expect(
                controller.createReservation(Number(lecture.id), Number(userId)),
            ).rejects.toThrow('This lecture is not available');
        });
    });
});
