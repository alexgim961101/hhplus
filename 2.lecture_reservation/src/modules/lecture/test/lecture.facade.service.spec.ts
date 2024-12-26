import { Test, TestingModule } from "@nestjs/testing";
import { LectureFacadeService } from "../service/lecture.facade.service";
import { LectureService } from "../service/lecture.service";
import { ReservationService } from "../../reservation/reservation.service";
import { PrismaService } from "../../../common/prisma.service";
import { LECTURE_REPOSITORY } from "../repository/lecture.repository.interface";
import { LecturePrismaRepository } from "../repository/lecture.prisma.repository";
import { CommonModule } from "../../../common/common.moduel";
import { ReservationModule } from "../../reservation/reservation.module";
import { RESERVATION_REPOSITORY } from "../../reservation/repository/reservation.repository.interface";
import { ReservationPrismaRepository } from "../../reservation/repository/reservation.prisma.repository";

describe('LectureFacadeService', () => {
    let lectureFacadeService: LectureFacadeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LectureFacadeService, LectureService, ReservationService, PrismaService, {
                provide: LECTURE_REPOSITORY,
                useClass: LecturePrismaRepository,
            }, {
                provide: RESERVATION_REPOSITORY,
                useClass: ReservationPrismaRepository,
            }]
        }).compile();

        lectureFacadeService = module.get<LectureFacadeService>(LectureFacadeService);
    })

    // 최소한 하나의 테스트 케이스 추가
    it('should be defined', () => {
        expect(lectureFacadeService).toBeDefined();
    });
})