import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ILectureRepository, LECTURE_REPOSITORY } from "../repository/lecture.repository.interface";
import { Lecture, User } from "@prisma/client";

@Injectable()
export class LectureCommandService {
    constructor(@Inject(LECTURE_REPOSITORY) private readonly lectureRepository: ILectureRepository) {}

    async createLectureReservation(lecture: Lecture, user: User, tx?: unknown) {
        const lectureWithLock = await this.lectureRepository.findByIdWithLock(Number(lecture.id), tx);


        if (lectureWithLock.currentAttendees >= lectureWithLock.maxAttendees) {
            throw new BadRequestException("수강 인원이 초과되었습니다.");
        }

        const reservation = await this.lectureRepository.insertLectureReservation(lecture, user, tx);

        await this.lectureRepository.updateLectureCurrentAttendees(Number(lecture.id), lectureWithLock.currentAttendees + 1, tx);

        return reservation;
    }
}
