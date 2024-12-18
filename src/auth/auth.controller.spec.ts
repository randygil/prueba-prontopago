import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDTO } from './auth.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock del AuthService
  const mockAuthService = {
    loginWithEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDTO = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return JWT token when login is successful', async () => {
      const expectedToken = 'jwt.token.here';
      mockAuthService.loginWithEmail.mockResolvedValue(expectedToken);

      const result = await controller.login(loginDto);

      expect(result).toBe(expectedToken);
      expect(authService.loginWithEmail).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.loginWithEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when credentials are invalid', async () => {
      mockAuthService.loginWithEmail.mockRejectedValue(
        new BadRequestException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.loginWithEmail).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should propagate errors from AuthService', async () => {
      const error = new Error('Service error');
      mockAuthService.loginWithEmail.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(authService.loginWithEmail).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    describe('input validation', () => {
      it('should handle empty email', async () => {
        const invalidDto = {
          ...loginDto,
          email: '',
        };

        mockAuthService.loginWithEmail.mockRejectedValue(
          new BadRequestException('Email is required'),
        );

        await expect(controller.login(invalidDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should handle empty password', async () => {
        const invalidDto = {
          ...loginDto,
          password: '',
        };

        mockAuthService.loginWithEmail.mockRejectedValue(
          new BadRequestException('Password is required'),
        );

        await expect(controller.login(invalidDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should handle invalid email format', async () => {
        const invalidDto = {
          ...loginDto,
          email: 'invalid-email',
        };

        mockAuthService.loginWithEmail.mockRejectedValue(
          new BadRequestException('Invalid email format'),
        );

        await expect(controller.login(invalidDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });
});
