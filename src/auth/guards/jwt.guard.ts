import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private _authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const bearer = req.headers['authorization'];
    const token = bearer ? bearer.replace(/^Bearer\s/, '') : '';
    const user = await this._authService.decodeToken(token);
    req.user = user;
    console.log('SETEE PRIMERO EL REQ');
    const validateToken = !token
      ? false
      : await this._authService.validateToken(token);

    return !!validateToken;
  }
}
