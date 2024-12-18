import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  async getDoctors() {
    return this.prisma.user.findMany({
      where: { role: UserRole.DOCTOR },
    });
  }
}
