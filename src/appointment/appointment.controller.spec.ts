import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { DoctorService } from '../doctor/doctor.service';
import { CreateAppointmentDto } from './appointment.dto';
import { User, UserRole } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

// Mock del decorador Roles y el guard
jest.mock('../auth/guards/roles.guard', () => ({
  Roles: (...roles: string[]) => {
    return (target: any, key?: string, descriptor?: any) => {
      if (descriptor) {
        Reflect.defineMetadata('roles', roles, descriptor.value);
        return descriptor;
      }
      Reflect.defineMetadata('roles', roles, target);
      return target;
    };
  },
}));

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let appointmentService: AppointmentService;
  let doctorService: DoctorService;

  const mockAppointmentService = {
    getAppointmentsByPatient: jest.fn(),
    createAppointment: jest.fn(),
    payAppointmentWithPaypal: jest.fn(),
  };

  const mockDoctorService = {
    getDoctors: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    lastName: 'User',
    password: 'password',
    speciality: null,
    role: UserRole.PATIENT,
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
        },
        {
          provide: DoctorService,
          useValue: mockDoctorService,
        },
        // {
        //   provide: AuthService,
        //   useValue: mockAuthService,
        // },
        // {
        //   provide: JwtService,
        //   useValue: mockJwtService,
        // },
      ],
      controllers: [AppointmentController],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    appointmentService = module.get<AppointmentService>(AppointmentService);
    doctorService = module.get<DoctorService>(DoctorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAppointments', () => {
    it('should return appointments for the current patient', async () => {
      const expectedAppointments = [
        { id: 1, patientId: 1, doctorId: 1, date: new Date() },
      ];
      mockAppointmentService.getAppointmentsByPatient.mockResolvedValue(
        expectedAppointments,
      );

      const result = await controller.getAppointments(mockUser);

      expect(result).toEqual(expectedAppointments);
      expect(
        mockAppointmentService.getAppointmentsByPatient,
      ).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getAppointmentsByPatient', () => {
    it('should return appointments for a specific patient ID', async () => {
      const patientId = 1;
      const expectedAppointments = [
        { id: 1, patientId, doctorId: 1, date: new Date() },
      ];
      mockAppointmentService.getAppointmentsByPatient.mockResolvedValue(
        expectedAppointments,
      );

      const result = await controller.getAppointmentsByPatient(patientId);

      expect(result).toEqual(expectedAppointments);
      expect(
        mockAppointmentService.getAppointmentsByPatient,
      ).toHaveBeenCalledWith(patientId);
    });
  });

  describe('createAppointment', () => {
    it('should create a new appointment', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        doctorId: 1,
        hour: 9,
        date: new Date().toISOString(),
      };
      const expectedAppointment = {
        id: 1,
        ...createAppointmentDto,
        patientId: mockUser.id,
      };
      mockAppointmentService.createAppointment.mockResolvedValue(
        expectedAppointment,
      );

      const result = await controller.createAppointment(
        mockUser,
        createAppointmentDto,
      );

      expect(result).toEqual(expectedAppointment);
      expect(mockAppointmentService.createAppointment).toHaveBeenCalledWith({
        ...createAppointmentDto,
        patientId: mockUser.id,
      });
    });
  });

  describe('payAppointmentWithPaypal', () => {
    it('should process paypal payment for an appointment', async () => {
      const appointmentId = '1';
      const expectedPaymentResult = { orderId: 'ORDER-123', status: 'CREATED' };
      mockAppointmentService.payAppointmentWithPaypal.mockResolvedValue(
        expectedPaymentResult,
      );

      const result = await controller.payAppointmentWithPaypal(appointmentId);

      expect(result).toEqual(expectedPaymentResult);
      expect(
        mockAppointmentService.payAppointmentWithPaypal,
      ).toHaveBeenCalledWith(Number(appointmentId));
    });
  });

  describe('getDoctors', () => {
    it('should return list of doctors', async () => {
      const expectedDoctors = [
        { id: 1, name: 'Dr. Smith', speciality: 'Cardiology' },
      ];
      mockDoctorService.getDoctors.mockResolvedValue(expectedDoctors);

      const result = await controller.getDoctors();

      expect(result).toEqual(expectedDoctors);
      expect(mockDoctorService.getDoctors).toHaveBeenCalled();
    });
  });
});
