export class BaseResponseDto<T> {
    timestamp: string;
    data: T;
    message: string;

    constructor(data: T, message: string) {
        this.timestamp = new Date().toISOString();
        this.data = data;
        this.message = message;
    }
}
