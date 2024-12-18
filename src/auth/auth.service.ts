import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Crypto } from '../utils/crypto';
import config from '../config';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async loginWithEmail(email: string, pass: string): Promise<string> {
    const user = await this.usersService.findOne(email);

    const hashedPassword = await Crypto.hashPassword(pass);
    if (user && user.password === hashedPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      const token = await this.jwtService.signAsync(userWithoutPassword);
      return token;
    }
    throw new BadRequestException('Invalid credentials');
  }

  decodeToken(token: string) {
    const decode = this.jwtService.decode(token);
    return JSON.parse(JSON.stringify(decode));
  }

  async validateToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: config.appKey,
      });
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
