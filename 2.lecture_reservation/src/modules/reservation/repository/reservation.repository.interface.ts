import { Reservation } from "@prisma/client";

export interface IReservationRepository {
    findByUserId(userId: number): Promise<Reservation[]>;
}

export const RESERVATION_REPOSITORY = 'RESERVATION_REPOSITORY';
