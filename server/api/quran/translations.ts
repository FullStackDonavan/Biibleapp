import prisma from '~/server/database/client'

export default defineEventHandler(async () => {
  const translations = await prisma.quranTranslation.findMany({
    select: {
        id: true,
        name: true,
        code: true,  
    },
  })

  return {translations}
})
