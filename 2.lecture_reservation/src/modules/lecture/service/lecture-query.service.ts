import { Inject, Injectable } from "@nestjs/common";
import { ILectureRepository, LECTURE_REPOSITORY } from "../repository/lecture.repository.interface";

@Injectable()
export class LectureQueryService {
    constructor(@Inject(LECTURE_REPOSITORY) private readonly lectureRepository: ILectureRepository) {}

    async getLectureById(lectureId: number, tx?: unknown) {
        return this.lectureRepository.findById(lectureId, tx);
    }
}
