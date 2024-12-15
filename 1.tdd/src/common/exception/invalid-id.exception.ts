export class InvalidIdException extends BadRequestException {
    constructor(message: string) {
        super(message)
    }
}