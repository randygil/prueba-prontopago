import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user', async () => {
    const mockUser = {
      id: 1,
      email: 'paciente@prontopago.com',
      name: 'Paciente',
      role: 'PATIENT',
      password: '12345678',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.findOne(mockUser.email);

    expect(result).toEqual(mockUser);
  });
});
