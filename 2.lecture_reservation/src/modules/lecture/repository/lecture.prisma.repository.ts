import { Lecture } from "@prisma/client";
import { Inject } from "@nestjs/common";
import { ILectureRepository } from "./lecture.repository.interface";
import { PrismaService } from "../../../common/prisma.service";

export class LecturePrismaRepository implements ILectureRepository {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    async findAvailableLecturesByDateTime(dateTime: Date): Promise<Lecture[]> {
        return this.prisma.lecture.findMany({
            where: {
                AND: [
                    {
                        applicationStart: {
                            lte: dateTime,
                        },
                    },
                    {
                        applicationEnd: {
                            gte: dateTime,
                        },
                    },
                    {
                        isAvailable: true,
                    },
                ],
            },
        });
    }
}
