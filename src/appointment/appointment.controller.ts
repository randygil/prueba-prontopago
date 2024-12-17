import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

import { Roles } from '../auth/guards/roles.guard';
import { ConfirmAppointmentDto, CreateAppointmentDto } from './appointment.dto';
import { User, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('appointment')
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('create')
  @Roles(UserRole.PATIENT)
  async createAppointment(
    @CurrentUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.createAppointment({
      ...createAppointmentDto,
      patientId: user.id,
    });
  }

  @Post('pay/:id/paypal')
  @Roles(UserRole.PATIENT)
  async payAppointmentWithPaypal(@Param('id') id: number) {
    return this.appointmentService.payAppointmentWithPaypal(id);
  }

  @Post('confirm')
  @Roles(UserRole.DOCTOR)
  async confirmAppointment(
    @Body() confirmAppointmentDto: ConfirmAppointmentDto,
  ) {
    return this.appointmentService.confirmAppointment(confirmAppointmentDto);
  }

  @Get('today')
  @Roles(UserRole.DOCTOR)
  async getTodayAppointments() {
    return this.appointmentService.getTodayAppointments();
  }

  @Get('patient/:id')
  @Roles(UserRole.DOCTOR)
  async getAppointmentsByPatient(@Param('id') id: number) {
    return this.appointmentService.getAppointmentsByPatient(id);
  }
}
