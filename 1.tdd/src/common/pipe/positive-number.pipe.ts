import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PositiveNumberPipe implements PipeTransform<string, number> {
    transform(value: string): number {
        if (!/^\d+$/.test(value)) {
            throw new BadRequestException('숫자만 입력 가능합니다.');
        }

        const num = parseInt(value, 10);
        if (isNaN(num) || num <= 0) {
            throw new BadRequestException('양의 정수만 입력 가능합니다.');
        }

        return num;
    }
}
