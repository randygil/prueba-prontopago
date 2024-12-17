import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const CreateAppointmentModel = z.object({
  doctorId: z.number(),
  patientId: z.number(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
});

export const CreateAppointmentSchema = extendApi(CreateAppointmentModel, {
  title: 'Create appointment',
  description: 'Create a new appointment',
});

export const ConfirmAppointmentSchema = extendApi(
  z
    .object({
      appointmentId: z.number().nonnegative().int(),
    })
    .required(),
);

export class ConfirmAppointmentDto extends createZodDto(
  ConfirmAppointmentSchema,
) {}

export class CreateAppointmentDto extends createZodDto(
  CreateAppointmentSchema,
) {}

export const SendVerificationSchema = z.object({
  type: z.enum(['email', 'sms']),
  email: z.string().optional(),
});

export const RequestSendVerificationSchema = extendApi(SendVerificationSchema, {
  title: 'Send verification request',
});

export class RequestSendVerificationDto extends createZodDto(
  RequestSendVerificationSchema,
) {}
