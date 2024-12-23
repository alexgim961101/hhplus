import { Lecture, PrismaClient, Reservation, User } from "@prisma/client";

export interface ILectureRepository {
    findById(lectureId: number, tx?: unknown): Promise<Lecture>;
    findByIdWithLock(lectureId: number, tx?: unknown): Promise<Lecture>;
    insertLectureReservation(lecture: Lecture, user: User, tx?: unknown): Promise<Reservation>;
    updateLectureCurrentAttendees(lectureId: number, count: number, tx?: unknown): Promise<Lecture>;
}

export const LECTURE_REPOSITORY = "LECTURE_REPOSITORY"
