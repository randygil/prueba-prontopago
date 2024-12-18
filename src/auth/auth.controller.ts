import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, LoginResponseDTO } from './auth.dto';
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '@anatine/zod-nestjs';

@Controller('auth')
@UsePipes(ZodValidationPipe)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'Login success',
    type: LoginResponseDTO,
  })
  @ApiOperation({ summary: 'Login', operationId: 'login' })
  @ApiResponse({ status: 200, description: 'Login success' })
  async login(@Body() loginDto: LoginDTO) {
    const token = await this.authService.loginWithEmail(
      loginDto.email,
      loginDto.password,
    );
    return token;
  }
}
