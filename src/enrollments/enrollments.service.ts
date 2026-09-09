import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId: dto.courseId,
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Inscripcion no encontrada');
    }

    if (enrollment.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('No podes acceder a esta inscripcion');
    }

    return enrollment;
  }

  async update(id: string, userId: string, role: string, dto: UpdateEnrollmentDto) {
    await this.findOne(id, userId, role);

    return this.prisma.enrollment.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string, role: string) {
    await this.findOne(id, userId, role);

    return this.prisma.enrollment.delete({
      where: { id },
    });
  }
}