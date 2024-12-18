import { Injectable, BadRequestException } from '@nestjs/common';

import { AppointmentStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { APPOINTMENT_COST } from '../payment/payment.types';
import {
  PayPalOrderResponse,
  PayPalOrderStatus,
} from '../payment/strategies/paypal/paypal.types';
import { OnEvent } from '@nestjs/event-emitter';
import moment from 'moment';
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
    hour: number;
  }) {
    const { patientId, doctorId, date, hour } = data;

    const appointmentDate = moment
      .utc(date)
      .set({ hour, minute: 0, second: 0, millisecond: 0 })
      .toDate();

    if ((hour < 7 || hour >= 12) && (hour < 14 || hour >= 18)) {
      throw new BadRequestException(
        `The appointment must be within the allowed hours (7:00 - 12:00, 14:00 - 18:00)`,
      );
    }

    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        date: {
          gte: appointmentDate,
          lt: moment(appointmentDate).add(1, 'hour').toDate(),
        },
      },
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

    this.paymentService.setStrategy(PaymentMethod.PAYPAL);

    const result = (await this.paymentService.pay(
      APPOINTMENT_COST,
    )) as PayPalOrderResponse;

    if (!result) {
      throw new BadRequestException('Error creating the payment');
    }
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
        paymentId: result.id,
      },
    });
    return {
      id: result.id,
      paymentUrl: link?.href,
    };
  }

  async confirmAppointment(appointmentId: number, userId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new BadRequestException('The appointment does not exist');
    }

    if (appointment.status !== AppointmentStatus.PENDING_FOR_CONFIRMATION) {
      throw new BadRequestException(
        'The appointment has not been paid for or has already been confirmed',
      );
    }

    if (appointment.doctorId !== userId) {
      throw new BadRequestException(
        'You are not authorized to confirm this appointment',
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CONFIRMED },
    });
  }

  async getTodayAppointments() {
    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'day').toDate();

    return this.prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: AppointmentStatus.CONFIRMED,
      },
      include: { patient: true },
    });
  }

  async getAppointmentsByPatient(patientId: number) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'asc' },
    });
  }

  async getAppointmentsByDoctor(doctorId: number) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      orderBy: { date: 'asc' },
    });
  }

  async cancelAppointment(appointmentId: number, userId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new BadRequestException('The appointment does not exist');
    }

    if (appointment.status !== AppointmentStatus.PENDING_FOR_CONFIRMATION) {
      throw new BadRequestException(
        'The appointment has not been paid for or has already been canceled',
      );
    }

    if (appointment.doctorId !== userId) {
      throw new BadRequestException(
        'You are not authorized to confirm this appointment',
      );
    }

    this.paymentService.setStrategy(appointment.paymentMethod as PaymentMethod);
    await this.paymentService.refund(appointment.paymentId as string);

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });
  }

  async completeAppointment(appointmentId: number, userId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new BadRequestException('The appointment does not exist');
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException(
        'The appointment has not been confirmed or has already been completed',
      );
    }

    if (appointment.doctorId !== userId) {
      throw new BadRequestException(
        'You are not authorized to complete this appointment',
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.FINISHED },
    });
  }

  @OnEvent('payment.success')
  async handleOrderCreatedEvent(payload: {
    paymentId: string;
    paymentMethod: PaymentMethod;
  }) {
    await this.prisma.appointment.update({
      where: { paymentId: payload.paymentId },
      data: {
        status: AppointmentStatus.PENDING_FOR_CONFIRMATION,
        paymentMethod: payload.paymentMethod,
      },
    });
  }

  @OnEvent('payment.failed')
  async handleOrderPaymentFailedEvent(payload: {
    paymentId: string;
    paymentMethod: PaymentMethod;
    errorMessage: string;
  }) {
    await this.prisma.appointment.update({
      where: { paymentId: payload.paymentId },
      data: {
        status: AppointmentStatus.PAYMENT_FAILED,
        paymentMethod: payload.paymentMethod,
        paymentError: payload.errorMessage,
      },
    });
  }
}
