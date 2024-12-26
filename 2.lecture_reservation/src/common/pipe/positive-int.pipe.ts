import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class PositiveIntPipe implements PipeTransform {
    transform(value: string) {
        const intValue = parseInt(value, 10);
        if (isNaN(intValue) || intValue <= 0) {
            throw new BadRequestException('Invalid positive integer');
        }
        return intValue;
    }
}
