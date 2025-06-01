const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_NAME || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD must be set in environment variables');
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      name: process.env.ADMIN_NAME,
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {}; 