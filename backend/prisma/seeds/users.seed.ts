import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { PrismaClient, Role } from 'generated/prisma/client';

export const seedUsers = async (prisma: PrismaClient) => {
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password', 10);
  const roles: Role[] = ['CUSTOMER', 'STAFF'];

  const usersData = Array.from({ length: 40 }, (_, i) => ({
    name: faker.person.fullName(),
    email: i === 0 ? 'test@example.com' : faker.internet.email(),
    emailVerifiedAt: faker.date.recent(),
    password: hashedPassword,
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    role: i === 0 ? 'ADMIN' : faker.helpers.arrayElement(roles),
  }));

  await prisma.user.createMany({
    data: usersData,
  });
};
