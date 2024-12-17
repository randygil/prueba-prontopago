import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithTokenData } from '../auth.types';

export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as RequestWithTokenData;
    if (!request.user) {
      throw new UnauthorizedException("User doesn't exist");
    }
    return request.user;
  },
);
