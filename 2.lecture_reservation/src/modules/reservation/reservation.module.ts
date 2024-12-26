import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationPrismaRepository } from './repository/reservation.prisma.repository';
import { RESERVATION_REPOSITORY } from './repository/reservation.repository.interface';
import { PrismaService } from '../../common/prisma.service';
import { ReservationController } from './reservation.controller';

@Module({
    controllers: [ReservationController],
    providers: [
        ReservationService,
        PrismaService,
        {
            provide: RESERVATION_REPOSITORY,
            useClass: ReservationPrismaRepository,
        },
    ],
    exports: [ReservationService],
})
export class ReservationModule {}
