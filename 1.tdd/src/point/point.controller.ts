import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Patch, ValidationPipe } from "@nestjs/common";
import { PointHistory, TransactionType, UserPoint } from "./point.model";
import { UserPointTable } from "src/database/userpoint.table";
import { PointHistoryTable } from "src/database/pointhistory.table";
import { PointDto } from "./point.dto";
import { PointService } from "./point.service";
import { PositiveNumberPipe } from "src/common/pipe/positive-number.pipe";


@Controller('/point')
export class PointController {

    constructor(
        private readonly userDb: UserPointTable,
        private readonly historyDb: PointHistoryTable,
        private readonly pointService: PointService,
    ) {}

    /**
     * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
     */
    @Get(':id')
    async point(@Param('id', PositiveNumberPipe) id: number): Promise<UserPoint> {
        return this.pointService.getUserPoint(id)
    }

    /**
     * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
     */
    @Get(':id/histories')
    async history(@Param('id', PositiveNumberPipe) id: number): Promise<PointHistory[]> {
        return this.pointService.getUserPointHistory(id)
    }

    /**
     * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
     */
    @Patch(':id/charge')
    async charge(
        @Param('id', PositiveNumberPipe) id: number,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        return this.pointService.chargeUserPoint(id, pointDto.amount)
    }

    /**
     * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
     */
    @Patch(':id/use')
    async use(
        @Param('id', PositiveNumberPipe) id: number,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        return this.pointService.useUserPoint(id, pointDto.amount)
    }
}