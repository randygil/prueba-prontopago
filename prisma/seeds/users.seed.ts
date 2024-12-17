import { PrismaClient, UserRole } from '@prisma/client';
import { Crypto } from '../../src/utils/crypto';

export const seedUsers = async (prisma: PrismaClient) => {
  const doctorPassword = await Crypto.hashPassword('12345678');
  await prisma.user.create({
    data: {
      email: 'medico@prontopago.com',
      role: UserRole.DOCTOR,
      name: 'Jonathan',
      lastName: 'Joestar',
      password: doctorPassword,
      speciality: 'Traumathology',
    },
  });

  await prisma.user.create({
    data: {
      email: 'paciente@prontopago.com',
      role: UserRole.PATIENT,
      name: 'Robert E.',
      lastName: 'Speedwagon',
      password: doctorPassword,
    },
  });
};
