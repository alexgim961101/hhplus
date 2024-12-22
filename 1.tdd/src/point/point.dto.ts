import { IsInt, IsPositive, Max } from 'class-validator';

export class PointDto {
    @IsInt()
    @IsPositive()
    @Max(Number.MAX_SAFE_INTEGER)
    amount: number;
}
