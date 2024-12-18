import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import config from '../config';
import { UserModule } from '../user/user.module';
import { JwtGuard } from './guards/jwt.guard';

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: config.appKey,

      signOptions: { expiresIn: '9999999 years' },
    }),
  ],
  providers: [AuthService, JwtGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtGuard],
})
export class AuthModule {}
