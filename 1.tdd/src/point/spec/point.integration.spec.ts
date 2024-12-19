import { UserPointTable } from "src/database/userpoint.table";
import { PointService } from "../point.service";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "src/database/database.module";

describe('Point Integration Test', () => {
    let service: PointService;
    let userPointTable: UserPointTable;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [DatabaseModule],
            providers: [PointService],
        }).compile();

        service = module.get<PointService>(PointService);
        userPointTable = module.get<UserPointTable>(UserPointTable);
    });

    describe('동시성 제어 테스트', () => {
        test('동시에 여러 충전 요청이 들어와도 포인트가 정확히 계산되어야 한다', async () => {
            // given
            const userId = 1;
            const chargeAmount = 1000;
            const concurrentRequests = 10;

            // when
            const promises = Array(concurrentRequests)
                .fill(null)
                .map(() => service.chargeUserPoint(userId, chargeAmount));
            
            await Promise.all(promises);

            // then
            const finalPoint = await service.getUserPoint(userId);
            expect(finalPoint.point).toBe(chargeAmount * concurrentRequests);
        });

        test('동시에 여러 사용 요청이 들어와도 잔액이 정확히 계산되어야 한다', async () => {
            // given
            const userId = 1;
            const initialAmount = 5000;
            const useAmount = 1000;
            const concurrentRequests = 3;

            await service.chargeUserPoint(userId, initialAmount);

            // when
            const promises = Array(concurrentRequests)
                .fill(null)
                .map(() => service.useUserPoint(userId, useAmount));
            
            await Promise.all(promises);

            // then
            const finalPoint = await service.getUserPoint(userId);
            expect(finalPoint.point).toBe(initialAmount - (useAmount * concurrentRequests));
        });

        test('동시에 여러 사용 요청이 들어올 때 잔액 부족 상황이 정확히 처리되어야 한다', async () => {
            // given
            const userId = 1;
            const initialAmount = 1500;
            const useAmount = 1000;
            
            await service.chargeUserPoint(userId, initialAmount);
            
            // when & then
            const promises = [
                service.useUserPoint(userId, useAmount),
                service.useUserPoint(userId, useAmount)
            ];
            
            await expect(Promise.all(promises)).rejects.toThrow('User point is not enough');
            
            const finalPoint = await service.getUserPoint(userId);
            expect(finalPoint.point).toBeLessThanOrEqual(initialAmount);
            expect(finalPoint.point).toBeGreaterThanOrEqual(initialAmount - useAmount);
        }, 30000);

        test('대량의 동시 요청이 들어와도 정확히 처리되어야 한다', async () => {
            // given
            const userId = 1;
            const initialAmount = 50000;
            const chargeAmount = 1000;
            const useAmount = 300;
            const concurrentRequests = 50;
            
            await service.chargeUserPoint(userId, initialAmount);
            
            // when
            const chargePromises = Array(concurrentRequests)
                .fill(null)
                .map(() => service.chargeUserPoint(userId, chargeAmount));
            
            const usePromises = Array(concurrentRequests)
                .fill(null)
                .map(() => service.useUserPoint(userId, useAmount));
            
            await Promise.all([...chargePromises, ...usePromises]);
            
            // then
            const finalPoint = await service.getUserPoint(userId);
            expect(finalPoint.point).toBe(initialAmount + (chargeAmount * concurrentRequests) - (useAmount * concurrentRequests));
        }, 60000);
    });
});