import { BadRequestException, Injectable } from "@nestjs/common";
import { PointHistoryTable } from "src/database/pointhistory.table";
import { UserPointTable } from "src/database/userpoint.table";
import { PointHistory, UserPoint } from "./point.model";

@Injectable()
export class PointService {
    constructor(
        private readonly userDb: UserPointTable,
        private readonly historyDb: PointHistoryTable,
    ) {}

    /**
     * 특정 유저의 포인트 조회 기능
     */
    async getUserPoint(userId: number): Promise<UserPoint> {
        return this.userDb.selectById(userId)
    }

    /**
     * 특정 유저의 포인트 충전/이용 조회
     */
    async getUserPointHistory(userId: number): Promise<PointHistory[]> {
        return this.historyDb.selectAllByUserId(userId)
    }


    /**
     * 특정 유저의 포인트 충전 기능
     */
    async chargeUserPoint(userId: number, amount: number): Promise<UserPoint> {
        const userPoint = await this.userDb.selectById(userId)
        return this.userDb.insertOrUpdate(userId, userPoint.point + amount)
    }

    /**
     * 특정 유저의 포인트 사용 기능
     */
    async useUserPoint(userId: number, amount: number): Promise<UserPoint> {
        const userPoint = await this.userDb.selectById(userId)
        if (userPoint.point < amount) {
            throw new BadRequestException('User point is not enough')
        }
        return this.userDb.insertOrUpdate(userId, userPoint.point - amount)
    }
}