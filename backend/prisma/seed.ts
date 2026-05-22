import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Salário', color: '#22c55e', icon: 'briefcase', type: 'INCOME' },
  { name: 'Freelance', color: '#16a34a', icon: 'laptop', type: 'INCOME' },
  { name: 'Investimentos', color: '#15803d', icon: 'trending-up', type: 'INCOME' },
  { name: 'Outros (Receita)', color: '#86efac', icon: 'plus-circle', type: 'INCOME' },
  { name: 'Alimentação', color: '#f97316', icon: 'utensils', type: 'EXPENSE' },
  { name: 'Transporte', color: '#0ea5e9', icon: 'car', type: 'EXPENSE' },
  { name: 'Moradia', color: '#8b5cf6', icon: 'home', type: 'EXPENSE' },
  { name: 'Saúde', color: '#ec4899', icon: 'heart', type: 'EXPENSE' },
  { name: 'Educação', color: '#f59e0b', icon: 'book', type: 'EXPENSE' },
  { name: 'Lazer', color: '#06b6d4', icon: 'smile', type: 'EXPENSE' },
  { name: 'Vestuário', color: '#a78bfa', icon: 'shopping-bag', type: 'EXPENSE' },
  { name: 'Contas', color: '#f87171', icon: 'file-text', type: 'EXPENSE' },
  { name: 'Outros (Despesa)', color: '#94a3b8', icon: 'tag', type: 'EXPENSE' },
];

async function main() {
  console.log('Seeding default categories...');
  let created = 0;
  for (const cat of defaultCategories) {
    const exists = await prisma.category.findFirst({
      where: { name: cat.name, isDefault: true, userId: null },
    });
    if (!exists) {
      await prisma.category.create({
        data: { ...cat, isDefault: true, userId: null },
      });
      created++;
    }
  }
  console.log(`✓ ${created} categorias criadas (${defaultCategories.length - created} já existiam).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
