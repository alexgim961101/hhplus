import { Injectable } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { ReservationService } from '../../reservation/reservation.service';

@Injectable()
export class LectureFacadeService {
    constructor(
        private readonly lectureService: LectureService,
        private readonly reservationService: ReservationService,
    ) {}

    async getAvailableLectures(userId: number, dateTime: Date) {
        const availableLectures = await this.lectureService.getAvailableLectures(dateTime);

        const reservations = await this.reservationService.getReservationsByUserId(userId);

        const filteredLectures = availableLectures.filter(
            (lecture) => !reservations.some((reservation) => reservation.lectureId === lecture.id),
        );

        return filteredLectures;
    }
}
