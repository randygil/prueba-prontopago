import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { CreateAppointmentDto } from './appointment.dto';
import { User, UserRole } from '@prisma/client';
import { AppointmentService } from './appointment.service';
import { DoctorService } from '../doctor/doctor.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppointmentModule } from './appointment.module';
import { DoctorModule } from '../doctor/doctor.module';

jest.mock('../auth/guards/roles.guard', () => ({
  Roles: () => jest.fn(),
}));

describe('AppointmentController', () => {
  let controller: AppointmentController;

  const mockAppointmentService = {
    getAppointmentsByPatient: jest.fn(),
    createAppointment: jest.fn(),
    payAppointmentWithPaypal: jest.fn(),
  };

  const mockDoctorService = {
    getDoctors: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    role: UserRole.PATIENT,
    lastName: 'User',
    password: 'password',
    speciality: null,
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
        },
        {
          provide: DoctorService,
          useValue: mockDoctorService,
        },
      ],
    })
      // Aquí mockeamos los módulos completos
      .overrideModule(AppointmentModule)
      .useModule({
        module: class MockAppointmentModule {},
        providers: [
          {
            provide: AppointmentService,
            useValue: mockAppointmentService,
          },
        ],
        exports: [AppointmentService],
      })
      .overrideModule(DoctorModule)
      .useModule({
        module: class MockDoctorModule {},
        providers: [
          {
            provide: DoctorService,
            useValue: mockDoctorService,
          },
        ],
        exports: [DoctorService],
      })
      .compile();

    controller = module.get<AppointmentController>(AppointmentController);
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
