import { Reservation } from "@prisma/client";
import { IReservationRepository } from "./reservation.repository.interface";
import { PrismaService } from "../../../common/prisma.service";
import { Inject } from "@nestjs/common";

export class ReservationPrismaRepository implements IReservationRepository {
    constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

    findByUserId(userId: number): Promise<Reservation[]> {
        return this.prismaService.reservation.findMany({
            where: {
                userId,
            },
        });
    }
}