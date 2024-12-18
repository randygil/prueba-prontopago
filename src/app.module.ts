import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PaymentModule } from './payment/payment.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    AppointmentModule,
    PaymentModule,
    EventEmitterModule.forRoot(),
    DoctorModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
