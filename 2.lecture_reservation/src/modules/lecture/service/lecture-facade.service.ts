import { Injectable } from "@nestjs/common";
import { LectureQueryService } from "./lecture-query.service";
import { LectureCommandService } from "./lecture-command.service";
import { PrismaService } from "src/common/prisma.service";
import { UserQueryService } from "src/modules/user/service/user-query.service";
import { Reservation } from "@prisma/client";

@Injectable()
export class LectureFacadeService {
    constructor(private readonly prisma: PrismaService, private readonly lectureQueryService: LectureQueryService, private readonly lectureCommandService: LectureCommandService, private readonly userQueryService: UserQueryService) {}

    async createLectureReservation(lectureId: number, userId: number) {
        return this.prisma.withTransaction<Reservation>(async (tx) => {
            const lecture = await this.lectureQueryService.getLectureById(lectureId, tx);
            const user = await this.userQueryService.getUserById(userId, tx);
            const reservation = await this.lectureCommandService.createLectureReservation(lecture, user, tx);
            return reservation;
        });
    }
}
