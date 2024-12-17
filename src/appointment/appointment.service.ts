import { Injectable, BadRequestException } from '@nestjs/common';

import { AppointmentStatus } from '@prisma/client';
import { ConfirmAppointmentDto } from './appointment.dto';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import {
  APPOINTMENT_COST,
  PaymentStrategyType,
} from '../payment/payment.types';
import {
  PayPalOrderResponse,
  PayPalOrderStatus,
} from '../payment/strategies/paypal/paypal.types';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
  ) {}

  async createAppointment(data: {
    patientId: number;
    doctorId: number;
    date: string;
  }) {
    const { patientId, doctorId, date } = data;

    const appointmentDate = new Date(date);
    const hour = appointmentDate.getHours();
    if ((hour < 7 || hour >= 12) && (hour < 14 || hour >= 18)) {
      throw new BadRequestException(
        'The appointment must be within the allowed hours',
      );
    }

    const existingAppointment = await this.prisma.appointment.findFirst({
      where: { doctorId, date: appointmentDate },
    });
    if (existingAppointment) {
      throw new BadRequestException(
        'An appointment already exists at this time',
      );
    }

    return this.prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date: appointmentDate,
        status: AppointmentStatus.PENDING_FOR_PAYMENT,
      },
    });
  }

  async payAppointmentWithPaypal(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new BadRequestException('The appointment does not exist');
    }

    if (appointment.status !== AppointmentStatus.PENDING_FOR_PAYMENT) {
      throw new BadRequestException(
        'The appointment has already been paid for',
      );
    }

    this.paymentService.setStrategy(PaymentStrategyType.PAYPAL);

    const result = (await this.paymentService.pay(
      APPOINTMENT_COST,
    )) as PayPalOrderResponse;

    if (result.status !== PayPalOrderStatus.CREATED) {
      await this.prisma.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.PAYMENT_FAILED,
          paymentId: result.id,
        },
      });

      throw new BadRequestException('Error creating the payment');
    }

    const link = result.links.find((link) => link.rel === 'approve');

    await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.PENDING_FOR_CONFIRMATION,
        paymentId: result.id,
      },
    });
    return {
      paymentUrl: link?.href,
    };
  }

  async confirmAppointment(confirmAppointmentDto: ConfirmAppointmentDto) {
    const { appointmentId } = confirmAppointmentDto;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new BadRequestException('The appointment does not exist');
    }

    if (appointment.status !== AppointmentStatus.PENDING_FOR_CONFIRMATION) {
      throw new BadRequestException('The appointment has not been paid for');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CONFIRMED },
    });
  }

  async getTodayAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return this.prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: AppointmentStatus.CONFIRMED,
      },
    });
  }

  async getAppointmentsByPatient(patientId: number) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'asc' },
    });
  }

  @OnEvent('payment.success')
  async handleOrderCreatedEvent(payload: { paymentId: string }) {
    await this.prisma.appointment.update({
      where: { paymentId: payload.paymentId },
      data: { status: AppointmentStatus.PENDING_FOR_CONFIRMATION },
    });
  }
}
