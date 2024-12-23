import { Injectable } from "@nestjs/common";
import { IUserRepository } from "./user.repository.interface";
import { PrismaClient, User } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";

@Injectable()
export class UserPrismaRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    findById(userId: number, tx?: PrismaClient): Promise<User> {
        const client = tx ?? this.prisma;
        return client.user.findUniqueOrThrow({
            where: {
                id: userId,
            },
        });
    }
}