import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.enrollmentsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.enrollmentsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, req.user.id, req.user.role, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.enrollmentsService.remove(id, req.user.id, req.user.role);
  }
}