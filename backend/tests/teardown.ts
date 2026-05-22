import prisma from '../src/utils/prisma';

module.exports = async () => {
  await prisma.$disconnect();
};
