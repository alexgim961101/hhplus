import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from '../reservation.service';
import { RESERVATION_REPOSITORY } from '../repository/reservation.repository.interface';
import { BadRequestException } from '@nestjs/common';

describe('ReservationService', () => {
    let service: ReservationService;
    let mockReservationRepository: any;

    beforeEach(async () => {
        mockReservationRepository = {
            findByUserId: jest.fn(),
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReservationService,
                {
                    provide: RESERVATION_REPOSITORY,
                    useValue: mockReservationRepository,
                },
            ],
        }).compile();

        service = module.get<ReservationService>(ReservationService);
    });

    describe('createReservation', () => {
        it('정상적인 경우 예약이 성공해야 함', async () => {
            // given
            const lectureId = 1;
            const userId = 1;
            const mockReservation = {
                id: 1n,
                lectureId: 1n,
                userId: 1n,
                createdAt: new Date(),
            };
            mockReservationRepository.create.mockResolvedValue(mockReservation);

            // when
            const result = await service.createReservation(lectureId, userId);

            // then
            expect(result).toEqual(mockReservation);
            expect(mockReservationRepository.create).toHaveBeenCalledWith(lectureId, userId);
        });

        it('Repository에서 예외가 발생하면 그대로 전파되어야 함', async () => {
            // given
            const lectureId = 1;
            const userId = 1;
            const errorMessage = 'Test error';
            mockReservationRepository.create.mockRejectedValue(
                new BadRequestException(errorMessage),
            );

            // when & then
            await expect(service.createReservation(lectureId, userId)).rejects.toThrow(
                errorMessage,
            );
        });
    });

    describe('getReservationsByUserId', () => {
        it('유저 아이디로 특강 신청 목록을 조회한다.', async () => {
            // given
            const userId = 1;
            const mockReservations = [
                { id: 1n, userId: 1n, lectureId: 1n, createdAt: new Date() },
                { id: 2n, userId: 1n, lectureId: 2n, createdAt: new Date() },
            ];
            mockReservationRepository.findByUserId.mockResolvedValue(mockReservations);

            // when
            const result = await service.getReservationsByUserId(userId);

            // then
            expect(result).toEqual(mockReservations);
            expect(mockReservationRepository.findByUserId).toHaveBeenCalledWith(userId);
        });

        it('예약이 없을 경우 빈 배열을 반환한다.', async () => {
            // given
            const userId = 1;
            mockReservationRepository.findByUserId.mockResolvedValue([]);

            // when
            const result = await service.getReservationsByUserId(userId);

            // then
            expect(result).toEqual([]);
            expect(mockReservationRepository.findByUserId).toHaveBeenCalledWith(userId);
        });
    });
});
