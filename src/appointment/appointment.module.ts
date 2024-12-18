import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { PaymentModule } from '../payment/payment.module';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [AuthModule, PaymentModule, DoctorModule],
  providers: [AppointmentService, PrismaService],
  controllers: [AppointmentController],
  exports: [AppointmentService],
})
export class AppointmentModule {}
