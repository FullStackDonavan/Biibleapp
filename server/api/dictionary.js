import { PrismaClient } from '@prisma/client';
import { defineEventHandler } from 'h3';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Fetch only the fields needed for the dictionary listing.
  const words = await prisma.wordTranslation.findMany({
    select: {
      xmlId: true,
      text: true,
      transliteration: true,
      english: true,
      pos: true,
      gender: true,
    },
    orderBy: { xmlId: 'asc' },
  });
  return { words };
});
