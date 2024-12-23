import { Body, Controller, HttpStatus, Param, Post } from '@nestjs/common';
import { LectureFacadeService } from './service/lecture-facade.service';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

@Controller('lecture')
export class LectureController {
    constructor(private readonly lectureFacadeService: LectureFacadeService) {}

    @Post(':lectureId/:userId')
    async createLectureReservation(@Param('lectureId') lectureId: string, @Param('userId') userId: string) {
        const reservation = await this.lectureFacadeService.createLectureReservation(Number(lectureId), Number(userId));
        return new BaseResponseDto(reservation, HttpStatus.CREATED.toString());
    }
}
