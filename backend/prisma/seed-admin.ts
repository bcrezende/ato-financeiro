import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * One-time, idempotent admin seed. Run manually (NOT in the deploy startCommand):
 *   railway run npx ts-node prisma/seed-admin.ts
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from env.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Administrador';

  if (!email || !password) {
    console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no ambiente antes de rodar.');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin já existe: ${email} — nada a fazer.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({ data: { email, name, passwordHash } });
  console.log(`✓ Admin criado: ${admin.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
