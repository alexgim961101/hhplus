import { Reservation } from '@prisma/client';

export interface IReservationRepository {
    create(lectureId: number, userId: number): Promise<Reservation>;
    findByUserId(userId: number): Promise<Reservation[]>;
}

export const RESERVATION_REPOSITORY = 'RESERVATION_REPOSITORY';
