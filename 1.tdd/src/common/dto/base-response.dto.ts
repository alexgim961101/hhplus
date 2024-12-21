export class BaseResponseDto<T> {
    timestamp: string
    message: string
    data: T

    constructor(message: string, data: T) {
        this.timestamp = new Date().toISOString()
        this.message = message
        this.data = data
    }
}