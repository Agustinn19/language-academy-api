import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("admin-test")
  adminTest() {
    return {
      message: "Acceso administrativo autorizado",
    };
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
