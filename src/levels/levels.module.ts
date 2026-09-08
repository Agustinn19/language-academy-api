import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LevelsController } from "./levels.controller";
import { LevelsService } from "./levels.service";

@Module({
  imports: [PrismaModule],
  controllers: [LevelsController],
  providers: [LevelsService],
  exports: [LevelsService],
})
export class LevelsModule {}
