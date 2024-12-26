import { Lecture } from "@prisma/client";

export interface ILectureRepository {
    findAvailableLecturesByDateTime(dateTime: Date): Promise<Lecture[]>;
}

export const LECTURE_REPOSITORY = "LECTURE_REPOSITORY"