import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(
    'AdminPassword123!',
    10,
  );

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@academy.com',
    },
    update: {
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@academy.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Academy',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`Admin creado/verificado: ${admin.email}`);

  await prisma.level.upsert({
    where: {
      code: 'A1',
    },
    update: {},
    create: {
      code: 'A1',
      name: 'Principiante',
      description: 'Nivel inicial de aprendizaje',
      order: 1,
    },
  });

  await prisma.level.upsert({
    where: {
      code: 'A2',
    },
    update: {},
    create: {
      code: 'A2',
      name: 'Basico',
      description: 'Nivel basico de aprendizaje',
      order: 2,
    },
  });

  console.log('Niveles iniciales verificados.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });