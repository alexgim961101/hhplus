import { IsInt, IsPositive, Max, Min } from "class-validator";

export class PointDto {
    @IsInt()
    @IsPositive()
    @Max(Number.MAX_SAFE_INTEGER)
    amount: number
}   