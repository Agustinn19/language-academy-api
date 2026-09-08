import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    return user;
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException("El email ya está registrado");
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      this.SALT_ROUNDS,
    );

    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    await this.findOne(id);

    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          "El email ya está registrado",
        );
      }
    }

    const updateData: {
      email?: string;
      passwordHash?: string;
      firstName?: string;
      lastName?: string;
    } = {};

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    if (data.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(
        data.password,
        this.SALT_ROUNDS,
      );
    }

    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: "Usuario eliminado correctamente",
    };
  }
}
