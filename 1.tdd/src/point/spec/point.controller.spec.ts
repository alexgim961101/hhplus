import { Test, TestingModule } from "@nestjs/testing"
import { PointController } from "../point.controller"
import { PointService } from "../point.service"
import { mockPointService } from "./mock/point.service.mock"
import { UserPointTable } from "src/database/userpoint.table"
import { mockUserPoint } from "./mock/userpoint.mock"
import { PointHistoryTable } from "src/database/pointhistory.table"
import { mockPointHistory } from "./mock/pointhistory.mock"
import { InvalidIdException } from "src/common/exception/invalid-id.exception"
import { TransactionType } from "../point.model"
import { BadRequestException } from "@nestjs/common"

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
    })

    describe('history', () => {
        test('특정 ID를 넘겨주면 유저의 포인트 충전/이용 내역을 조회할 수 있다.', async () => {
            // given
            const userId = 1
            const expectedResult = [
                { 
                    id: 1, 
                    userId: userId, 
                    type: TransactionType.CHARGE,
                    amount: 1000,
                    timeMillis: Date.now() 
                },
                { 
                    id: 2, 
                    userId: userId, 
                    type: TransactionType.CHARGE,
                    amount: 2000,
                    timeMillis: Date.now() 
                }
            ]
            jest.spyOn(service, 'getUserPointHistory').mockResolvedValue(expectedResult)

            // when
            const result = await controller.history(userId)

            // then
            expect(result).toEqual(expectedResult)
            expect(service.getUserPointHistory).toHaveBeenCalledWith(userId)
        })
    })

    describe('charge', () => {
        test('특정 유저의 포인트를 충전할 수 있다.', async () => {
            // given
            const userId = 1;
            const pointDto = { amount: 1000 };
            const expectedUserPoint = { 
                id: userId, 
                point: pointDto.amount, 
                updateMillis: Date.now() 
            };
            jest.spyOn(service, 'chargeUserPoint').mockResolvedValue(expectedUserPoint);

            // when
            const result = await controller.charge(userId, pointDto);

            // then
            expect(result).toEqual(expectedUserPoint);
            expect(service.chargeUserPoint).toHaveBeenCalledWith(userId, pointDto.amount);
        });
    });

    describe('use', () => {
        test('특정 유저의 포인트를 사용할 수 있다.', async () => {
            // given
            const userId = 1;
            const pointDto = { amount: 1000 };
            const expectedUserPoint = { 
                id: userId, 
                point: 0, 
                updateMillis: Date.now() 
            };
            jest.spyOn(service, 'useUserPoint').mockResolvedValue(expectedUserPoint);

            // when
            const result = await controller.use(userId, pointDto);

            // then
            expect(result).toEqual(expectedUserPoint);
            expect(service.useUserPoint).toHaveBeenCalledWith(userId, pointDto.amount);
        });

        test('잔액이 부족할 경우 예외가 발생한다', async () => {
            // given
            const userId = 1;
            const pointDto = { amount: 1000 };
            jest.spyOn(service, 'useUserPoint').mockRejectedValue(new BadRequestException('User point is not enough'));

            // when & then
            await expect(controller.use(userId, pointDto))
                .rejects
                .toThrow(BadRequestException);
        });
    });
})