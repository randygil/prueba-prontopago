// filepath: /home/randy/Devel/prueba-tecnica-prontopago/src/auth/decorators/roles.guard.decorator.ts
import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { JwtGuard } from './jwt.guard';

export function Roles(...roles: string[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtGuard, RoleGuard),
  );
}