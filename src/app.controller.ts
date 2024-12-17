import { Controller, Get, Request } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RequestWithTokenData } from './auth/auth.types';
import { Roles } from './auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles(UserRole.DOCTOR)
  async getUsers(@Request() req: RequestWithTokenData) {
    return { message: `Hola ${req.user.name}` };
  }
}
