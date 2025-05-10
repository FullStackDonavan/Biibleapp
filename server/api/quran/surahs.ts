import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const translationId = Number(query.translation)
  
    if (!translationId) {
      return []
    }
  
    const surahs = await prisma.quranSurah.findMany({
      where: { translationId },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        transliteration: true,
      },
    })
  
    return surahs
  })
  