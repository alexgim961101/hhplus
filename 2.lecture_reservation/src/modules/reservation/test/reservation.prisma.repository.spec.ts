import { PrismaService } from "../../../common/prisma.service";
import { ReservationPrismaRepository } from "../repository/reservation.prisma.repository";
import { Test } from "@nestjs/testing";
import { TestingModule } from "@nestjs/testing";

describe('ReservationPrismaRepository', () => {
    let repository: ReservationPrismaRepository;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ReservationPrismaRepository, PrismaService],
        }).compile();

        repository = module.get<ReservationPrismaRepository>(ReservationPrismaRepository);
        prismaService = module.get<PrismaService>(PrismaService);

        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
        await prismaService.$executeRaw`TRUNCATE TABLE reservations`;
        await prismaService.$executeRaw`TRUNCATE TABLE lectures`;
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
    })

    describe('findByUserId', () => {
        it('유저 아이디로 예약 목록을 조회할 수 있다.', async () => {
            // given
            const userId = 1;
            const mockLectures = [
                { id: 1, title: 'Lecture 1', maxAttendees: 10, instructorId: 1 },
                { id: 2, title: 'Lecture 2', maxAttendees: 10, instructorId: 1 },
            ];
            const mockReservations = [
                { id: 1, userId: userId, lectureId: 1 },
                { id: 2, userId: 2, lectureId: 2 },
                { id: 3, userId: userId, lectureId: 2 },
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
            const result = await repository.findByUserId(userId);

            // then
            expect(result).toHaveLength(2);
            expect(result.every(r => Number(r.userId) === userId)).toBe(true);
        });

        it('예약이 없는 경우 빈 배열을 반환한다.', async () => {
            // given
            const userId = 999;

            // when
            const result = await repository.findByUserId(userId);

            // then
            expect(result).toHaveLength(0);
        });

        it('다른 유저의 예약은 조회되지 않는다.', async () => {
            // given
            const userId = 1;
            const otherUserId = 2;
            const mockLectures = [
                { id: 1, title: 'Lecture 1', maxAttendees: 10, instructorId: 1 },
            ];
            const mockReservations = [
                { id: 1, userId: otherUserId, lectureId: 1 },
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
            const result = await repository.findByUserId(userId);

            // then
            expect(result).toHaveLength(0);
        });
    })
})