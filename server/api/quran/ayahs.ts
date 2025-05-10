// server/api/quran/ayahs.ts
import prisma from '~/server/database/client'
import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
  
    const surahId = Number(query.surah)
    const translationId = Number(query.translation)
  
    if (!surahId || !translationId) {
      return { error: 'Missing surah or translation parameter' }
    }
  
    const ayahs = await prisma.quranAyah.findMany({
      where: {
        surahId,
        translationId,
      },
      orderBy: { ayahNumber: 'asc' },
      select: {
        id: true,
        ayahNumber: true,
        text: true,
        translation: true,
      },
    })
  
    return ayahs
  })
  