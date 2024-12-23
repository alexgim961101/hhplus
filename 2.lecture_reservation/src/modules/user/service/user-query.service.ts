import { Injectable } from "@nestjs/common";
import { IUserRepository } from "../repository/user.repository.interface";

@Injectable()
export class UserQueryService {
    constructor(private readonly userRepository: IUserRepository) {}

    async getUserById(userId: number, tx?: unknown) {
        return await this.userRepository.findById(userId, tx);
    }
}