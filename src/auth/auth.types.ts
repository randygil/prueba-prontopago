import { User } from '@prisma/client';
import { Request } from 'express';

export type TokenData = Omit<User, 'password'>;

export type RequestWithTokenData = Request & { user: TokenData };
