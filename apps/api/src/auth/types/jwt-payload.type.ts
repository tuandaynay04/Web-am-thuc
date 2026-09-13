import { Role } from '../../../generated/prisma/enums';

export type JwtPayload = {
  sub: number;
  email: string;
  role: Role;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  role: Role;
};