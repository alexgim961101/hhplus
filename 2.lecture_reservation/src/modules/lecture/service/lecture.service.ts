import { Inject, Injectable } from '@nestjs/common';
import { LECTURE_REPOSITORY } from '../repository/lecture.repository.interface';
import { ILectureRepository } from '../repository/lecture.repository.interface';

@Injectable()
export class LectureService {
    constructor(
        @Inject(LECTURE_REPOSITORY) private readonly lectureRepository: ILectureRepository,
    ) {}

    async getAvailableLectures(dateTime: Date) {
        // 1. 현재 시간을 기준으로 신청 가능한 강의 목록을 조회
        const availableLectures =
            await this.lectureRepository.findAvailableLecturesByDateTime(dateTime);
        return availableLectures;
    }
}
