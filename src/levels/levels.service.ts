import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLevelDto } from "./dto/create-level.dto";
import { UpdateLevelDto } from "./dto/update-level.dto";

@Injectable()
export class LevelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLevelDto: CreateLevelDto) {
    try {
      return await this.prisma.level.create({ data: createLevelDto });
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new ConflictException("A level with this name or code already exists");
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.level.findMany({ orderBy: { name: "asc" } });
  }

  async findOne(id: string) {
    const level = await this.prisma.level.findUnique({ where: { id } });
    if (!level) {
      throw new NotFoundException(`Level with ID "${id}" not found`);
    }
    return level;
  }

  async update(id: string, updateLevelDto: UpdateLevelDto) {
    await this.findOne(id);
    try {
      return await this.prisma.level.update({ where: { id }, data: updateLevelDto });
    } catch (error: any) {
      if (error?.code === "P2002") {
        throw new ConflictException("A level with this name or code already exists");
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.level.delete({ where: { id } });
  }
}
