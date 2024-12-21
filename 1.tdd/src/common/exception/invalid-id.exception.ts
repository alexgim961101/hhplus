import { BadRequestException } from "@nestjs/common";

export class InvalidIdException extends BadRequestException {
    constructor(message: string) {
        super(message)
    }
}