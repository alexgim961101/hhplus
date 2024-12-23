import { Module } from "@nestjs/common";
import { LectureController } from "./lecture.controller";
import { LectureService } from "./lecture.service";
import { CommonModule } from "src/common/common.moduel";

@Module({
  controllers: [LectureController],
  providers: [LectureService],
  imports: [CommonModule],
})
export class LectureModule {}
