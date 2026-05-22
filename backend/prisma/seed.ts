import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // Receitas
  { name: 'Salário', color: '#22c55e', icon: 'briefcase', type: CategoryType.INCOME },
  { name: 'Freelance', color: '#16a34a', icon: 'laptop', type: CategoryType.INCOME },
  { name: 'Investimentos', color: '#15803d', icon: 'trending-up', type: CategoryType.INCOME },
  { name: 'Outros (Receita)', color: '#86efac', icon: 'plus-circle', type: CategoryType.INCOME },
  // Despesas
  { name: 'Alimentação', color: '#f97316', icon: 'utensils', type: CategoryType.EXPENSE },
  { name: 'Transporte', color: '#0ea5e9', icon: 'car', type: CategoryType.EXPENSE },
  { name: 'Moradia', color: '#8b5cf6', icon: 'home', type: CategoryType.EXPENSE },
  { name: 'Saúde', color: '#ec4899', icon: 'heart', type: CategoryType.EXPENSE },
  { name: 'Educação', color: '#f59e0b', icon: 'book', type: CategoryType.EXPENSE },
  { name: 'Lazer', color: '#06b6d4', icon: 'smile', type: CategoryType.EXPENSE },
  { name: 'Vestuário', color: '#a78bfa', icon: 'shopping-bag', type: CategoryType.EXPENSE },
  { name: 'Contas', color: '#f87171', icon: 'file-text', type: CategoryType.EXPENSE },
  { name: 'Outros (Despesa)', color: '#94a3b8', icon: 'tag', type: CategoryType.EXPENSE },
];

async function main() {
  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name_userId: { name: cat.name, userId: null as any } },
      update: {},
      create: { ...cat, isDefault: true, userId: null },
    });
  }
  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
