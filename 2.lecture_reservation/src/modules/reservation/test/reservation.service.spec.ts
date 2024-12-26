import { ReservationService } from "../reservation.service";
import { Test, TestingModule } from "@nestjs/testing";
import { IReservationRepository, RESERVATION_REPOSITORY } from "../repository/reservation.repository.interface";
import { ReservationPrismaRepository } from "../repository/reservation.prisma.repository";

describe('ReservationService', () => {
    let service: ReservationService;
    let mockReservationRepository: any;

    beforeEach(async () => {
        mockReservationRepository = {
            findByUserId: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [ReservationService, {
                provide: RESERVATION_REPOSITORY,
                useValue: mockReservationRepository,
            }]
        }).compile();

        service = module.get<ReservationService>(ReservationService);
    })

    describe('getReservationsByUserId', () => {
        it('유저 아이디로 특강 신청 목록을 조회한다.', async () => {
            const userId = 1;
            const mockReservations = [
                { id: 1, userId: 1n, lectureId: 1n, createdAt: new Date() },
                { id: 2, userId: 1n, lectureId: 2n, createdAt: new Date() }
            ];
            mockReservationRepository.findByUserId.mockResolvedValue(mockReservations);

            // when
            const result = await service.getReservationsByUserId(userId);

            // then
            expect(result).toEqual(mockReservations);
            expect(mockReservationRepository.findByUserId).toHaveBeenCalledWith(userId);
        })

        it('예약이 없을 경우 빈 배열을 반환한다.', async () => {
            // given
            const userId = 1;
            mockReservationRepository.findByUserId.mockResolvedValue([]);

            // when
            const result = await service.getReservationsByUserId(userId);

            // then
            expect(result).toEqual([]);
            expect(mockReservationRepository.findByUserId).toHaveBeenCalledWith(userId);
        })
    })
})