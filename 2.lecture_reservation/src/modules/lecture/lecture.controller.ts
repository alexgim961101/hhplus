import { Controller, Get, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

import { LectureFacadeService } from './service/lecture.facade.service';
@Controller('lecture')
export class LectureController {
    constructor(private readonly lectureFacadeService: LectureFacadeService) {}

    /**
     * 특강 신청 가능 목록 조회
     * @param userId 사용자 ID
     * @returns 특강 신청 가능 목록
     */
    @Get('available/:userId')
    async getAvailableLectures(@Param('userId', ParseIntPipe) userId: number) {
        const availableLectures = await this.lectureFacadeService.getAvailableLectures(
            userId,
            new Date(),
        );
        return new BaseResponseDto(availableLectures, HttpStatus.CREATED.toString());
    }
}
