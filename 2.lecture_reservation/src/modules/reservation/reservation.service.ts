import { Inject, Injectable } from '@nestjs/common';
import {
    IReservationRepository,
    RESERVATION_REPOSITORY,
} from './repository/reservation.repository.interface';
import { Reservation } from '@prisma/client';

@Injectable()
export class ReservationService {
    constructor(
        @Inject(RESERVATION_REPOSITORY)
        private readonly reservationRepository: IReservationRepository,
    ) {}

    async getReservationsByUserId(userId: number): Promise<Reservation[]> {
        return this.reservationRepository.findByUserId(userId);
    }

    async createReservation(lectureId: number, userId: number): Promise<Reservation> {
        return this.reservationRepository.create(lectureId, userId);
    }
}
