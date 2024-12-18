import { IsInt, IsPositive, Min } from "class-validator";

export class PointBody {
    @IsInt()
    @IsPositive()
    @Min(0)
    amount: number
}   