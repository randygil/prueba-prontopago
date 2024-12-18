import { User } from '@prisma/client';
import { Request } from 'express';

export type TokenData = Omit<User, 'password'> & {
  createdAt: string;
  updatedAt: string;
};

export type RequestWithTokenData = Request & { user: TokenData };
