import { Test, TestingModule } from '@nestjs/testing';
import { LectureService } from '../service/lecture.service';
import { LECTURE_REPOSITORY } from '../repository/lecture.repository.interface';

describe('LectureService', () => {
    let lectureService: LectureService;
    let mockLectureRepository: any;

    beforeEach(async () => {
        mockLectureRepository = {
            findAvailableLecturesByDateTime: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LectureService,
                {
                    provide: LECTURE_REPOSITORY,
                    useValue: mockLectureRepository,
                },
            ],
        }).compile();

        lectureService = module.get<LectureService>(LectureService);
    });

    describe('getAvailableLectures', () => {
        it('현재 시간을 기준으로 신청 가능한 강의 목록을 조회한다.', async () => {
            // given
            const mockDate = new Date();
            const mockLectures = [
                {
                    id: 1,
                    applicationStart: new Date(mockDate.getTime() - 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                },
                {
                    id: 2,
                    applicationStart: new Date(mockDate.getTime() - 1000 * 60 * 60 * 24),
                    applicationEnd: new Date(mockDate.getTime() + 1000 * 60 * 60 * 24),
                },
            ];
            mockLectureRepository.findAvailableLecturesByDateTime.mockResolvedValue(mockLectures);

            // when
            const result = await lectureService.getAvailableLectures(mockDate);

            // then
            expect(result).toEqual(mockLectures);
            expect(mockLectureRepository.findAvailableLecturesByDateTime).toHaveBeenCalledWith(
                mockDate,
            );
        });

        it('현재 시간을 기준으로 신청 가능한 강의 목록이 없으면 빈 배열을 반환한다.', async () => {
            // given
            const mockDate = new Date();
            const mockResult = [];
            mockLectureRepository.findAvailableLecturesByDateTime.mockResolvedValue(mockResult);

            // when
            const result = await lectureService.getAvailableLectures(mockDate);

            // then
            expect(result).toEqual(mockResult);
            expect(mockLectureRepository.findAvailableLecturesByDateTime).toHaveBeenCalledWith(
                mockDate,
            );
        });

        it('강의 신청기간에 현재가 포함되어 있고 강의의 상태가 신청 가능상태여도 현재 자신이 신청한 강의는 보여주면 안된다.', async () => {
            // given
            const mockDate = new Date();
            const mockResult = [];

            mockLectureRepository.findAvailableLecturesByDateTime.mockResolvedValue(mockResult);

            // when
            const result = await lectureService.getAvailableLectures(mockDate);

            // then
            expect(result).toEqual(mockResult);
            expect(mockLectureRepository.findAvailableLecturesByDateTime).toHaveBeenCalledWith(
                mockDate,
            );
        });
    });
});
