import { PrismaService } from '../../../common/prisma.service';
import { LecturePrismaRepository } from '../repository/lecture.prisma.repository';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing';

describe('LecturePrismaRepository', () => {
    let repository: LecturePrismaRepository;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LecturePrismaRepository,
                PrismaService,
            ],
        })
        .compile();

        repository = module.get<LecturePrismaRepository>(LecturePrismaRepository);
        prismaService = module.get<PrismaService>(PrismaService);
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
        await prismaService.$executeRaw`TRUNCATE TABLE reservations`;
        await prismaService.$executeRaw`TRUNCATE TABLE lectures`;
        await prismaService.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
    });

    describe('findAvailableLecturesByDateTime', () => {
        it('현재 시간이 강의 신청 시작 시간과 종료 시간 사이에 있는 강의들을 조회할 수 있다.', async () => {
            // given
            const mockDate = new Date();
            const lectures = [
                {
                    instructorId: 1n,
                    title: 'Past Lecture',
                    applicationStart: new Date(mockDate.getTime() - 1000 * 60 * 60 * 2), // 2시간 전
                    applicationEnd: new Date(mockDate.getTime() - 1000 * 60 * 60),      // 1시간 전
                    dateTime: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                    isAvailable: true,
                },
                {
                    instructorId: 2n,
                    title: 'Now Lecture',
                    applicationStart: new Date(mockDate.getTime() - 1000 * 60 * 60 * 2), // 2시간 전
                    applicationEnd: new Date(mockDate.getTime() + 1000 * 60 * 60),      // 1시간 전
                    dateTime: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24 * 2),
                    isAvailable: true,
                },
            ]

            await prismaService.lecture.createMany({
                data: lectures,
            });

            // when
            const result = await repository.findAvailableLecturesByDateTime(mockDate);
            console.log(result);
            // then
            expect(result).toMatchObject([lectures[1]]);
        });

        it('', async () => {
            
        })
    });
});
