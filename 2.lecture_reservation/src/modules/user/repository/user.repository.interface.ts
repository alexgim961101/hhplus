import { User } from "@prisma/client";

export interface IUserRepository {
    findById(userId: number, tx?: unknown): Promise<User>;
}

export const USER_REPOSITORY = "USER_REPOSITORY";
