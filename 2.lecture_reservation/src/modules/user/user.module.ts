import { CommonModule } from "../../../src/common/common.moduel";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Module } from "@nestjs/common";

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [CommonModule],
})
export class UserModule {}
