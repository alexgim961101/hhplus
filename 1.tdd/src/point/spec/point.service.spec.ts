import { Test, TestingModule } from "@nestjs/testing"
import { PointService } from "../point.service"
import { UserPointTable } from "src/database/userpoint.table"
import { mockUserPoint } from "./mock/userpoint.mock"
import { PointHistoryTable } from "src/database/pointhistory.table"
import { mockPointHistory } from "./mock/pointhistory.mock"
import { TransactionType } from "../point.model"
import { BadRequestException } from "@nestjs/common"

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

    afterEach(() => {
        jest.clearAllMocks()
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

    describe('getUserPoint', () => {
        test('특정 유저의 포인트 충전 및 조회 기능', async () => {
            // given
            const userId = 1
            const pointHistoryList = [
                { id: 1, userId: userId, amount: 1000, type: TransactionType.CHARGE, timeMillis: Date.now() },
                { id: 2, userId: userId, amount: 1000, type: TransactionType.USE, timeMillis: Date.now() },
                { id: 3, userId: userId, amount: 1000, type: TransactionType.CHARGE, timeMillis: Date.now() },
            ]
            jest.spyOn(mockPointHistory, 'selectAllByUserId').mockResolvedValue(pointHistoryList)

            // when
            const result = await service.getUserPointHistory(userId)

            // then
            expect(result).toEqual(pointHistoryList)
            expect(mockPointHistory.selectAllByUserId).toHaveBeenCalledWith(userId)
        })
    })

    describe('chargeUserPoint', () => {
        test('특정 유저의 포인트 충전 기능', async () => {
            // given
            const userId = 1
            const amount = 1000
            const updateMillis = Date.now()
            const expectedUserPoint = { id: userId, point: amount, updateMillis: updateMillis }
            jest.spyOn(mockUserPoint, 'selectById').mockResolvedValue({...expectedUserPoint, point: 0})
            jest.spyOn(mockUserPoint, 'insertOrUpdate').mockResolvedValue(expectedUserPoint)
            
            // when
            const result = await service.chargeUserPoint(userId, amount)

            // then
            expect(result).toEqual(expectedUserPoint)
            expect(mockUserPoint.selectById).toHaveBeenCalledWith(userId)
            expect(mockUserPoint.insertOrUpdate).toHaveBeenCalledWith(userId, amount)
        })
    })

    describe('useUserPoint', () => {
        test('특정 유저의 포인트 사용 기능', async () => {
            // given
            const userId = 1
            const amount = 1000
            const expectedUserPoint = { id: userId, point: 0, updateMillis: Date.now() }
            jest.spyOn(mockUserPoint, 'selectById').mockResolvedValue({...expectedUserPoint, point: amount})
            jest.spyOn(mockUserPoint, 'insertOrUpdate').mockResolvedValue(expectedUserPoint)

            // when
            const result = await service.useUserPoint(userId, amount)

            // then
            expect(result).toEqual(expectedUserPoint)
            expect(mockUserPoint.selectById).toHaveBeenCalledWith(userId)
            expect(mockUserPoint.insertOrUpdate).toHaveBeenCalledWith(userId, 0)
        })

        test('특정 유저의 포인트가 부족할 경우 예외를 발생시킨다.', async () => {
            // given
            const userId = 1
            const amount = 10000
            const userPoint = { id: userId, point: 1000, updateMillis: Date.now() }
            jest.spyOn(mockUserPoint, 'selectById').mockResolvedValue(userPoint)

            // when && then
            await expect(service.useUserPoint(userId, amount)).rejects.toThrow(BadRequestException)
            expect(mockUserPoint.selectById).toHaveBeenCalledWith(userId)
        })
    })
})