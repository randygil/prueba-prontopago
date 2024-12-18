import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { BadRequestException } from '@nestjs/common';
import { Crypto } from '../utils/crypto';
import { User, UserRole } from '@prisma/client';
import config from '../config';

jest.mock('../utils/crypto');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // Mock del usuario para pruebas
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    lastName: 'Test',
    speciality: null,
    name: 'Test User',
    role: UserRole.PATIENT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...mockUserWithoutPassword } = mockUser;
  // Mock de los servicios
  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    decode: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('loginWithEmail', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return JWT token when credentials are valid', async () => {
      const expectedToken = 'jwt.token.here';
      const hashedPassword = 'hashedPassword123';

      // Mock Crypto.hashPassword
      (Crypto.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock user service response
      mockUserService.findOne.mockResolvedValue(mockUser);

      // Mock JWT sign
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.loginWithEmail(
        loginData.email,
        loginData.password,
      );

      expect(result).toBe(expectedToken);
      expect(userService.findOne).toHaveBeenCalledWith(loginData.email);
      expect(Crypto.hashPassword).toHaveBeenCalledWith(loginData.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        mockUserWithoutPassword,
      );
    });

    it('should throw BadRequestException when user not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);
      (Crypto.hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');

      await expect(
        service.loginWithEmail(loginData.email, loginData.password),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is invalid', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      (Crypto.hashPassword as jest.Mock).mockResolvedValue(
        'wrongHashedPassword',
      );

      await expect(
        service.loginWithEmail(loginData.email, loginData.password),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('decodeToken', () => {
    it('should decode JWT token correctly', () => {
      const token = 'valid.jwt.token';
      const decodedToken = {
        ...JSON.parse(JSON.stringify(mockUserWithoutPassword)),
      };

      mockJwtService.decode.mockReturnValue(decodedToken);

      const result = service.decodeToken(token);

      expect(result).toEqual(decodedToken);
      expect(jwtService.decode).toHaveBeenCalledWith(token);
    });

    it('should return parsed JSON of decoded token', () => {
      const token = 'valid.jwt.token';
      const decodedToken = { ...mockUserWithoutPassword };

      mockJwtService.decode.mockReturnValue(decodedToken);

      const result = service.decodeToken(token);

      expect(result).toEqual(JSON.parse(JSON.stringify(decodedToken)));
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const token = 'valid.jwt.token';
      const decodedToken = { ...mockUserWithoutPassword };

      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);

      const result = await service.validateToken(token);

      expect(result).toEqual(decodedToken);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: config.appKey,
      });
    });

    it('should throw BadRequestException when token is invalid', async () => {
      const token = 'invalid.jwt.token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.validateToken(token)).rejects.toThrow(
        BadRequestException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: config.appKey,
      });
    });
  });
});
