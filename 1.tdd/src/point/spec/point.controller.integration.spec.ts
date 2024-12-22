import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from '../point.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PointService } from '../point.service';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

describe('PointController Integration Test', () => {
    let app: INestApplication;
    let controller: PointController;
    let service: PointService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [DatabaseModule],
            controllers: [PointController],
            providers: [PointService],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        controller = module.get<PointController>(PointController);
        service = module.get<PointService>(PointService);
    });

    afterEach(async () => {
        await app.close();
    });

    describe('포인트 충전/사용 통합 테스트', () => {
        test('포인트 충전 후 조회가 정상적으로 동작해야 한다', async () => {
            // given
            const userId = 1;
            const amount = 1000;

            // when
            const chargeResponse = await request(app.getHttpServer())
                .patch(`/point/${userId}/charge`)
                .send({ amount });

            const pointResponse = await request(app.getHttpServer()).get(`/point/${userId}`);

            // then
            expect(chargeResponse.status).toBe(HttpStatus.OK);
            expect(pointResponse.status).toBe(HttpStatus.OK);
            expect(pointResponse.body.point).toBe(amount);
        });

        test('포인트 사용 후 히스토리가 정상적으로 조회되어야 한다', async () => {
            // given
            const userId = 1;
            const chargeAmount = 2000;
            const useAmount = 1000;

            // when
            await request(app.getHttpServer())
                .patch(`/point/${userId}/charge`)
                .send({ amount: chargeAmount });

            await request(app.getHttpServer())
                .patch(`/point/${userId}/use`)
                .send({ amount: useAmount });

            const historyResponse = await request(app.getHttpServer()).get(
                `/point/${userId}/histories`,
            );

            // then
            expect(historyResponse.status).toBe(HttpStatus.OK);
            expect(historyResponse.body).toHaveLength(2);
            expect(historyResponse.body[0].amount).toBe(chargeAmount);
            expect(historyResponse.body[1].amount).toBe(useAmount);
        });

        test('잔액이 부족할 경우 사용이 실패해야 한다', async () => {
            // given
            const userId = 1;
            const chargeAmount = 1000;
            const useAmount = 2000;

            // when
            await request(app.getHttpServer())
                .patch(`/point/${userId}/charge`)
                .send({ amount: chargeAmount });

            const useResponse = await request(app.getHttpServer())
                .patch(`/point/${userId}/use`)
                .send({ amount: useAmount });

            // then
            expect(useResponse.status).toBe(HttpStatus.BAD_REQUEST);
        });

        test('잘못된 입력값으로 요청시 적절한 에러가 반환되어야 한다', async () => {
            // given
            const userId = 1;
            const invalidAmount = -1000;

            // when
            const chargeResponse = await request(app.getHttpServer())
                .patch(`/point/${userId}/charge`)
                .send({ amount: invalidAmount });

            const invalidUserResponse = await request(app.getHttpServer()).get(`/point/-1`);

            // then
            expect(chargeResponse.status).toBe(HttpStatus.BAD_REQUEST);
            expect(invalidUserResponse.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });
});
