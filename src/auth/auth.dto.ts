import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const LoginSchema = extendApi(
  z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
  }),
);

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  token: z.string(),
});

export class LoginDTO extends createZodDto(LoginSchema) {}

export class LoginResponseDTO extends createZodDto(LoginResponseSchema) {}
