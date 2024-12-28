import { PrismaService } from '../../../common/prisma.service';
import { ReservationPrismaRepository } from '../repository/reservation.prisma.repository';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing';

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
    });

    describe('findByUserId', () => {
        it('유저 아이디로 예약 목록을 조회할 수 있다.', async () => {
            // given
            const userId = 1n;
            const mockLectures = [
                { title: 'Lecture 1', maxAttendees: 10, instructorId: 1n },
                { title: 'Lecture 2', maxAttendees: 10, instructorId: 1n },
            ];
            const mockReservations = [
                { userId: userId, lectureId: 1n },
                { userId: 2n, lectureId: 2n },
                { userId: userId, lectureId: 2n },
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
            const result = await repository.findByUserId(Number(userId));

            // then
            expect(result).toHaveLength(2);
            expect(result.every((r) => Number(r.userId) === Number(userId))).toBe(true);
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
            const userId = 1n;
            const otherUserId = 2n;
            const mockLectures = [{ title: 'Lecture 1', maxAttendees: 10, instructorId: 1 }];
            const mockReservations = [{ id: 1n, userId: otherUserId, lectureId: 1n }];

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
            const result = await repository.findByUserId(Number(userId));

            // then
            expect(result).toHaveLength(0);
        });
    });

    describe('create', () => {
        it('정상적인 경우 예약이 성공해야 함', async () => {
            // given
            const userId = 1n;
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Test Lecture',
                    instructorId: 999n,
                    maxAttendees: 30,
                    currentAttendees: 0,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60),
                    isAvailable: true,
                },
            });

            // when
            const result = await repository.create(Number(lecture.id), Number(userId));

            // then
            expect(result.userId).toBe(userId);
            expect(result.lectureId).toBe(lecture.id);

            const updatedLecture = await prismaService.lecture.findUnique({
                where: { id: lecture.id },
            });
            expect(updatedLecture.currentAttendees).toBe(1);
        });

        it('강의가 존재하지 않는 경우 예외가 발생해야 함', async () => {
            // when & then
            await expect(repository.create(999, 1)).rejects.toThrow('Lecture not found');
        });

        it('신청 시작 전인 경우 예외가 발생해야 함', async () => {
            // given
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Future Lecture',
                    instructorId: 999n,
                    maxAttendees: 30,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
                    applicationStart: new Date(Date.now() + 1000 * 60 * 60),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60 * 2),
                    isAvailable: true,
                },
            });

            // when & then
            await expect(repository.create(Number(lecture.id), 1)).rejects.toThrow(
                'Registration period has not started yet',
            );
        });

        it('신청 기간이 종료된 경우 예외가 발생해야 함', async () => {
            // given
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Past Lecture',
                    instructorId: 999n,
                    maxAttendees: 30,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60 * 2),
                    applicationEnd: new Date(Date.now() - 1000 * 60 * 60),
                    isAvailable: true,
                },
            });

            // when & then
            await expect(repository.create(Number(lecture.id), 1)).rejects.toThrow(
                'Registration period has ended',
            );
        });

        it('isAvailable이 false인 경우 예외가 발생해야 함', async () => {
            // given
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Unavailable Lecture',
                    instructorId: 999n,
                    maxAttendees: 30,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60),
                    isAvailable: false,
                },
            });

            // when & then
            await expect(repository.create(Number(lecture.id), 1)).rejects.toThrow(
                'This lecture is not available',
            );
        });

        it('수강 인원이 초과된 경우 예외가 발생해야 함', async () => {
            // given
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Full Lecture',
                    instructorId: 999n,
                    maxAttendees: 1,
                    currentAttendees: 1,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60),
                    isAvailable: true,
                },
            });

            // when & then
            await expect(repository.create(Number(lecture.id), 1)).rejects.toThrow(
                'No available seats',
            );
        });

        it('자신이 만든 강의인 경우 예외가 발생해야 함', async () => {
            // given
            const instructorId = 1n;
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'My Lecture',
                    instructorId,
                    maxAttendees: 30,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60),
                    isAvailable: true,
                },
            });

            // when & then
            await expect(
                repository.create(Number(lecture.id), Number(instructorId)),
            ).rejects.toThrow('Cannot register for your own lecture');
        });

        it('이미 신청한 강의인 경우 예외가 발생해야 함', async () => {
            // given
            const userId = 1n;
            const lecture = await prismaService.lecture.create({
                data: {
                    title: 'Test Lecture',
                    instructorId: 999n,
                    maxAttendees: 30,
                    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    applicationStart: new Date(Date.now() - 1000 * 60 * 60),
                    applicationEnd: new Date(Date.now() + 1000 * 60 * 60),
                    isAvailable: true,
                },
            });

            // 첫 번째 신청
            await repository.create(Number(lecture.id), Number(userId));

            // when & then
            await expect(repository.create(Number(lecture.id), Number(userId))).rejects.toThrow(
                'Already reserved',
            );
        });
    });
});
