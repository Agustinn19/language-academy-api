import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LanguagesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.language.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const language =
      await this.prisma.language.findUnique({
        where: {
          id,
        },
      });

    if (!language) {
      throw new NotFoundException(
        'Idioma no encontrado',
      );
    }

    return language;
  }

  async create(data: CreateLanguageDto) {
    try {
      return await this.prisma.language.create({
        data: {
          name: data.name.trim(),
          code: data.code.trim().toLowerCase(),
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(
          'Unique constraint failed',
        )
      ) {
        throw new ConflictException(
          'El idioma o código ya existe',
        );
      }

      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateLanguageDto,
  ) {
    await this.findOne(id);

    try {
      return await this.prisma.language.update({
        where: {
          id,
        },
        data: {
          ...(data.name !== undefined && {
            name: data.name.trim(),
          }),
          ...(data.code !== undefined && {
            code: data.code.trim().toLowerCase(),
          }),
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(
          'Unique constraint failed',
        )
      ) {
        throw new ConflictException(
          'El idioma o código ya existe',
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.language.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Idioma eliminado correctamente',
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(
          'Foreign key constraint failed',
        )
      ) {
        throw new ConflictException(
          'No se puede eliminar el idioma porque tiene cursos asociados',
        );
      }

      throw error;
    }
  }
}