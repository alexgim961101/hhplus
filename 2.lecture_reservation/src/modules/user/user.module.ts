import { CommonModule } from "../../../src/common/common.moduel";
import { Module } from "@nestjs/common";
import { UserFacadeService } from "./service/user-facade.service";
import { UserQueryService } from "./service/user-query.service";
import { UserCommandService } from "./service/user-command.service";
import { USER_REPOSITORY } from "./repository/user.repository.interface";
import { UserPrismaRepository } from "./repository/user.prisma.repository";

@Module({
  controllers: [],
  providers: [UserFacadeService, UserQueryService, UserCommandService, {
    provide: USER_REPOSITORY,
    useClass: UserPrismaRepository,
  }],
  imports: [CommonModule],
})
export class UserModule {}
