import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/guards/roles.guard';
import { AppointmentService } from '../appointment/appointment.service';

@Controller('doctor')
export class DoctorController {
  constructor(private appointmentService: AppointmentService) {}

  @Get('appointments')
  @Roles(UserRole.DOCTOR)
  async getDoctorAppointments(@CurrentUser() user: User) {
    return this.appointmentService.getAppointmentsByDoctor(user.id);
  }

  @Post('appointments/:id/cancel')
  @Roles(UserRole.DOCTOR)
  async cancelAppointment(@Param('id') id: string, @CurrentUser() user: User) {
    return this.appointmentService.cancelAppointment(Number(id), user.id);
  }

  @Post('appointments/:id/confirm')
  @Roles(UserRole.DOCTOR)
  async confirmAppointment(@Param('id') id: string, @CurrentUser() user: User) {
    return this.appointmentService.confirmAppointment(Number(id), user.id);
  }

  @Get('appointments/today')
  @Roles(UserRole.DOCTOR)
  async getTodayAppointments() {
    return this.appointmentService.getTodayAppointments();
  }

  @Post('appointments/:id/complete')
  @Roles(UserRole.DOCTOR)
  async completeAppointment(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.appointmentService.completeAppointment(Number(id), user.id);
  }
}
