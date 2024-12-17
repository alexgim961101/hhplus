import { Test, TestingModule } from "@nestjs/testing"
import { PointService } from "../point.service"
import { UserPointTable } from "src/database/userpoint.table"
import { mockUserPoint } from "./mock/userpoint.mock"
import { PointHistoryTable } from "src/database/pointhistory.table"
import { mockPointHistory } from "./mock/pointhistory.mock"

describe('PointService', () => {
    let service: PointService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PointService, { 
                provide: UserPointTable,
                useValue: mockUserPoint
             },
             {
                provide: PointHistoryTable,
                useValue: mockPointHistory
             }],
        }).compile()

        service = module.get<PointService>(PointService)
    })

    describe('getUserPoint', () => {
        test('유저의 포인트를 조회할 수 있다.', async () => {
            // given
            const user = { id: 1, point: 1000, updateMillis: Date.now() }
            jest.spyOn(mockUserPoint, 'selectById').mockResolvedValue(user)
            // when
            const result = await service.getUserPoint(user.id)

            // then
            expect(result).toEqual(user)
            expect(mockUserPoint.selectById).toHaveBeenCalledWith(user.id)
        })
    })
})