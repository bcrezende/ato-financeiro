import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  const user = await prisma.user.findUnique({
    where: { email: 'bruno@rezendetransportes.com.br' },
  });

  if (!user) {
    console.log('Usuário não encontrado, pulando migração.');
    return;
  }

  console.log(`Usuário encontrado: ${user.name} (${user.id})`);

  // Cria categoria Compras se não existir
  let compras = await prisma.category.findFirst({
    where: { name: 'Compras', userId: user.id },
  });
  if (!compras) {
    compras = await prisma.category.create({
      data: { name: 'Compras', color: '#06b6d4', icon: 'shopping-bag', type: 'EXPENSE', isDefault: false, userId: user.id },
    });
    console.log('Categoria Compras criada.');
  }

  // Mapeia categorias padrão pelo nome
  const catNames = ['Lazer', 'Educação', 'Moradia', 'Salário'];
  const catMap: Record<string, string> = { Compras: compras.id };
  for (const name of catNames) {
    const cat = await prisma.category.findFirst({ where: { name, isDefault: true } });
    if (cat) catMap[name] = cat.id;
  }

  const transactions = [
    { description: 'Valmor Motos',  amount: 247.50,  type: 'EXPENSE', date: new Date('2026-06-02'), cat: 'Lazer',    notes: 'Relaçao da CRF', isRecurring: true,  frequency: 'MONTHLY' },
    { description: 'Casa Bonita',   amount: 575.73,  type: 'EXPENSE', date: new Date('2026-06-05'), cat: 'Compras',  notes: null,               isRecurring: false, frequency: null },
    { description: 'Faculdade',     amount: 66.00,   type: 'EXPENSE', date: new Date('2026-06-10'), cat: 'Educação', notes: null,               isRecurring: true,  frequency: 'MONTHLY' },
    { description: 'Faxineira',     amount: 520.00,  type: 'EXPENSE', date: new Date('2026-06-05'), cat: 'Moradia',  notes: null,               isRecurring: true,  frequency: 'MONTHLY' },
    { description: 'Internet',      amount: 139.99,  type: 'EXPENSE', date: new Date('2026-06-10'), cat: 'Moradia',  notes: null,               isRecurring: true,  frequency: 'MONTHLY' },
    { description: 'Aluguel',       amount: 1600.00, type: 'EXPENSE', date: new Date('2026-06-10'), cat: 'Moradia',  notes: null,               isRecurring: true,  frequency: 'MONTHLY' },
    { description: 'Salario',       amount: 8816.00, type: 'INCOME',  date: new Date('2026-06-02'), cat: 'Salário',  notes: null,               isRecurring: false, frequency: null },
    { description: 'Renner',        amount: 191.86,  type: 'EXPENSE', date: new Date('2026-06-10'), cat: 'Compras',  notes: null,               isRecurring: false, frequency: null },
  ];

  let created = 0;
  for (const t of transactions) {
    const categoryId = catMap[t.cat];
    if (!categoryId) { console.log(`Categoria não encontrada: ${t.cat}`); continue; }

    const exists = await prisma.transaction.findFirst({
      where: { userId: user.id, description: t.description, amount: t.amount, date: t.date },
    });
    if (!exists) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          description: t.description,
          amount: t.amount,
          type: t.type as 'INCOME' | 'EXPENSE',
          date: t.date,
          categoryId,
          notes: t.notes,
          isRecurring: t.isRecurring,
          frequency: t.frequency as any,
        },
      });
      created++;
    }
  }

  console.log(`✓ ${created} transações migradas (${transactions.length - created} já existiam).`);
}

migrate()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
