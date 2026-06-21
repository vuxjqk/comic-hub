import { Exclude } from 'class-transformer';
import { User as PrismaUser, Role } from 'generated/prisma/client';

export class User implements PrismaUser {
  id!: number;
  name!: string;
  email!: string;
  emailVerifiedAt!: Date | null;
  phone!: string | null;
  address!: string | null;
  avatar!: string | null;
  isActive!: boolean;
  role!: Role;
  createdAt!: Date;
  updatedAt!: Date;

  @Exclude()
  password!: string | null;

  @Exclude()
  googleId!: string | null;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
