import { Injectable } from "@nestjs/common";
import { UserQueryService } from "./user-query.service";
import { UserCommandService } from "./user-command.service";

@Injectable()
export class UserFacadeService {
    constructor(
        private readonly userQueryService: UserQueryService,
        private readonly userCommandService: UserCommandService,
    ) {}
}