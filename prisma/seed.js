const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Using bcryptjs from your package.json

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@kominfo.go.id';
  const plainPassword = 'Admin123!';

  // Check if admin already exists to prevent duplicates
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠️ Admin user already exists.');
    return;
  }

  // Hash the password securely
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Create the Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin DKIPS',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin created successfully! Email: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });