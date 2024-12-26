import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { BaseResponseDto } from '../../common/dto/base-response.dto';
import { PositiveIntPipe } from '../../common/pipe/positive-int.pipe';

@Controller('reservation')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    /***
     * 특강 신청 목록 조회
     * @param userId 유저 아이디
     * @returns 특강 신청 목록
     */
    @Get(':userId')
    async getReservationList(@Param('userId', PositiveIntPipe) userId: number) {
        return new BaseResponseDto(
            await this.reservationService.getReservationsByUserId(userId),
            HttpStatus.OK.toString(),
        );
    }
}
