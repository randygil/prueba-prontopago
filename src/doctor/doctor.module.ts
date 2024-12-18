import { forwardRef, Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { AppointmentModule } from '../appointment/appointment.module';
import { DoctorService } from './doctor.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DoctorController],
  providers: [DoctorService, PrismaService],
  imports: [forwardRef(() => AppointmentModule)],
  exports: [DoctorService],
})
export class DoctorModule {}
