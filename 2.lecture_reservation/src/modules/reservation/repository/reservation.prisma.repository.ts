import { Reservation } from '@prisma/client';
import { IReservationRepository } from './reservation.repository.interface';
import { PrismaService } from '../../../common/prisma.service';
import { Inject, BadRequestException } from '@nestjs/common';

export class ReservationPrismaRepository implements IReservationRepository {
    constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

    findByUserId(userId: number): Promise<Reservation[]> {
        return this.prismaService.reservation.findMany({
            where: {
                userId,
            },
        });
    }

    async create(lectureId: number, userId: number): Promise<Reservation> {
        return await this.prismaService.$transaction(async (tx) => {
            const lecture = await tx.$queryRaw`
                SELECT id, maxAttendees, currentAttendees, instructorId, 
                       applicationStart, applicationEnd, isAvailable 
                FROM lectures 
                WHERE id = ${BigInt(lectureId)} 
                FOR UPDATE
            `;

            if (!lecture[0]) {
                throw new BadRequestException('Lecture not found');
            }

            const now = new Date();
            if (now < lecture[0].applicationStart) {
                throw new BadRequestException('Registration period has not started yet');
            }

            if (now > lecture[0].applicationEnd) {
                throw new BadRequestException('Registration period has ended');
            }

            if (!lecture[0].isAvailable) {
                throw new BadRequestException('This lecture is not available');
            }

            if (lecture[0].instructorId === BigInt(userId)) {
                throw new BadRequestException('Cannot register for your own lecture');
            }

            if (lecture[0].currentAttendees >= lecture[0].maxAttendees) {
                throw new BadRequestException('No available seats');
            }

            try {
                const reservation = await tx.reservation.create({
                    data: {
                        lectureId: BigInt(lectureId),
                        userId: BigInt(userId),
                    },
                });

                await tx.lecture.update({
                    where: { id: BigInt(lectureId) },
                    data: { currentAttendees: lecture[0].currentAttendees + 1 },
                });

                return reservation;
            } catch (error) {
                if (error.code === 'P2002') {
                    throw new BadRequestException('Already reserved');
                }
                throw error;
            }

        });
    }
}
