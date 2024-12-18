/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { DoctorController } from './doctor.controller';
import { AppointmentService } from '../appointment/appointment.service';
import { User, UserRole } from '@prisma/client';

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

describe('DoctorController', () => {
  let controller: DoctorController;
  let appointmentService: AppointmentService;

  const mockAppointmentService = {
    getAppointmentsByDoctor: jest.fn(),
    cancelAppointment: jest.fn(),
    confirmAppointment: jest.fn(),
    getTodayAppointments: jest.fn(),
    completeAppointment: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'doctor@test.com',
    lastName: 'Test',
    password: 'password',
    speciality: 'Test',
    role: UserRole.DOCTOR,
    name: 'Dr. Test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorController],
      providers: [
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
        },
      ],
    }).compile();

    controller = module.get<DoctorController>(DoctorController);
    appointmentService = module.get<AppointmentService>(AppointmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDoctorAppointments', () => {
    it('should return appointments for the current doctor', async () => {
      const expectedAppointments = [
        { id: 1, doctorId: mockUser.id, patientId: 2, date: new Date() },
      ];
      mockAppointmentService.getAppointmentsByDoctor.mockResolvedValue(
        expectedAppointments,
      );

      const result = await controller.getDoctorAppointments(mockUser);

      expect(result).toEqual(expectedAppointments);
      expect(
        mockAppointmentService.getAppointmentsByDoctor,
      ).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel the specified appointment', async () => {
      const appointmentId = '1';
      const expectedResult = {
        id: Number(appointmentId),
        status: 'CANCELLED',
        doctorId: mockUser.id,
      };
      mockAppointmentService.cancelAppointment.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.cancelAppointment(
        appointmentId,
        mockUser,
      );

      expect(result).toEqual(expectedResult);
      expect(mockAppointmentService.cancelAppointment).toHaveBeenCalledWith(
        Number(appointmentId),
        mockUser.id,
      );
    });
  });

  describe('confirmAppointment', () => {
    it('should confirm the specified appointment', async () => {
      const appointmentId = '1';
      const expectedResult = {
        id: Number(appointmentId),
        status: 'CONFIRMED',
        doctorId: mockUser.id,
      };
      mockAppointmentService.confirmAppointment.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.confirmAppointment(
        appointmentId,
        mockUser,
      );

      expect(result).toEqual(expectedResult);
      expect(mockAppointmentService.confirmAppointment).toHaveBeenCalledWith(
        Number(appointmentId),
        mockUser.id,
      );
    });
  });

  describe('getTodayAppointments', () => {
    it('should return appointments for today', async () => {
      const today = new Date();
      const expectedAppointments = [
        { id: 1, date: today, doctorId: mockUser.id, patientId: 2 },
        { id: 2, date: today, doctorId: mockUser.id, patientId: 3 },
      ];
      mockAppointmentService.getTodayAppointments.mockResolvedValue(
        expectedAppointments,
      );

      const result = await controller.getTodayAppointments();

      expect(result).toEqual(expectedAppointments);
      expect(mockAppointmentService.getTodayAppointments).toHaveBeenCalled();
    });
  });

  describe('completeAppointment', () => {
    it('should mark the appointment as completed', async () => {
      const appointmentId = '1';
      const expectedResult = {
        id: Number(appointmentId),
        status: 'COMPLETED',
        doctorId: mockUser.id,
      };
      mockAppointmentService.completeAppointment.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.completeAppointment(
        appointmentId,
        mockUser,
      );

      expect(result).toEqual(expectedResult);
      expect(mockAppointmentService.completeAppointment).toHaveBeenCalledWith(
        Number(appointmentId),
        mockUser.id,
      );
    });
  });
});
