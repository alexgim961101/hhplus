import { Module } from "@nestjs/common";
import { LectureController } from "./lecture.controller";
import { LectureFacadeService } from "./service/lecture-facade.service";
import { CommonModule } from "src/common/common.moduel";
import { LectureQueryService } from "./service/lecture-query.service";
import { LectureCommandService } from "./service/lecture-command.service";
import { LECTURE_REPOSITORY } from "./repository/lecture.repository.interface";
import { LecturePrismaRepository } from "./repository/lecture.prisma.repository";

@Module({
  controllers: [LectureController],
  providers: [LectureFacadeService, LectureQueryService, LectureCommandService, {
    provide: LECTURE_REPOSITORY,
    useClass: LecturePrismaRepository,
  }],
  imports: [CommonModule],
})
export class LectureModule {}
