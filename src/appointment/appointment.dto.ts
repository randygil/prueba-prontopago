import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const CreateAppointmentModel = z.object({
  doctorId: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Invalid date format, expected YYYY-MM-DD',
  }),
  hour: z.number().int().min(7).max(18),
});

export const CreateAppointmentSchema = extendApi(CreateAppointmentModel, {
  title: 'Create appointment',
  description: 'Create a new appointment',
});

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
