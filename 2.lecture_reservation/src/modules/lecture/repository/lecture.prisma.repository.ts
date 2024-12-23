import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import { ILectureRepository } from "./lecture.repository.interface";
import { Lecture, PrismaClient, Reservation, User } from "@prisma/client";

@Injectable()
export class LecturePrismaRepository implements ILectureRepository {
    constructor(@Inject() private readonly prisma: PrismaService) {}

    async findById(lectureId: number, tx?: PrismaClient): Promise<Lecture> {
        const client = tx ?? this.prisma;
        return client.lecture.findUniqueOrThrow({
            where: {
                id: lectureId,
            },
        });
    }

    async findByIdWithLock(lectureId: number, tx?: PrismaClient): Promise<Lecture> {
        const client = tx ?? this.prisma;
        return client.$queryRaw`
            SELECT * FROM lectures
            WHERE id = ${lectureId}
            FOR UPDATE
        `
    }

    async insertLectureReservation(lecture: Lecture, user: User, tx?: PrismaClient): Promise<Reservation> {
        const client = tx ?? this.prisma
        return tx.reservation.create({
            data: {
                lectureId: lecture.id,
                userId: user.id,
            },
        });
    }

    async updateLectureCurrentAttendees(lectureId: number, count: number, tx?: PrismaClient): Promise<Lecture> {
        const client = tx ?? this.prisma;
        return client.lecture.update({
            where: { id: lectureId },
            data: { currentAttendees: count },
        });
    }
}