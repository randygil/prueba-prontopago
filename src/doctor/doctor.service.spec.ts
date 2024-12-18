import { Test, TestingModule } from '@nestjs/testing';
import { DoctorService } from './doctor.service';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@prisma/client';

describe('DoctorService', () => {
  let service: DoctorService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDoctors', () => {
    it('should return all users with DOCTOR role', async () => {
      const mockDoctors = [
        {
          id: 1,
          email: 'doctor1@test.com',
          name: 'Dr. Smith',
          role: UserRole.DOCTOR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'doctor2@test.com',
          name: 'Dr. Jones',
          role: UserRole.DOCTOR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockDoctors);

      const result = await service.getDoctors();

      expect(result).toEqual(mockDoctors);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.DOCTOR },
      });
    });

    it('should return empty array when no doctors found', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getDoctors();

      expect(result).toEqual([]);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.DOCTOR },
      });
    });

    it('should handle prisma errors properly', async () => {
      const error = new Error('Database error');
      mockPrismaService.user.findMany.mockRejectedValue(error);

      await expect(service.getDoctors()).rejects.toThrow('Database error');
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.DOCTOR },
      });
    });
  });
});
