import { Test, TestingModule } from "@nestjs/testing"
import { PointController } from "../point.controller"
import { PointService } from "../point.service"
import { mockPointService } from "./mock/point.service.mock"
import { UserPointTable } from "src/database/userpoint.table"
import { mockUserPoint } from "./mock/userpoint.mock"
import { PointHistoryTable } from "src/database/pointhistory.table"
import { mockPointHistory } from "./mock/pointhistory.mock"
import { InvalidIdException } from "src/common/exception/invalid-id.exception"

describe('PointController', () => {
    let controller: PointController
    let service: PointService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PointController],
            providers: [
                {
                    provide: PointService,
                    useValue: mockPointService
                },
                {
                    provide: UserPointTable,
                    useValue: mockUserPoint
                },
                {
                    provide: PointHistoryTable,
                    useValue: mockPointHistory
                }   
            ]
        }).compile()

        controller = module.get<PointController>(PointController)
        service = module.get<PointService>(PointService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('point', () => {
        test('특정 ID를 넘겨주면 유저의 포인트를 조회할 수 있다.', async () => {
            // given
            const userId = 1
            const userPoint = { id: userId, point: 1000, updateMillis: Date.now() }
            jest.spyOn(service, 'getUserPoint').mockResolvedValue(userPoint)

            // when
            const result = await controller.point(userId)

            // then
            expect(result).toEqual(userPoint)
            expect(service.getUserPoint).toHaveBeenCalledWith(userId)
        })

        test('유저 ID가 음수이면 예외를 발생시킨다.', async () => {
            // given
            const userId = '-1'

            // when && then
            await expect(controller.point(userId)).rejects.toThrow(InvalidIdException)
        })

        test('유저 ID가 숫자가 아니면 예외를 발생시킨다.', async () => {
            // given
            const userId = 'abc'

            // when && then
            await expect(controller.point(userId)).rejects.toThrow(InvalidIdException)
        })
    })
})