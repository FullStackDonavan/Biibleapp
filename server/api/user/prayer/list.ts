// server/api/user/prayer/list.ts
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const user = await getUserByAuthToken(authToken)
    if (!user) throw createError({ statusCode: 401, message: 'Invalid token' })

    const entries = await prisma.prayerJournalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return { entries }
  } catch (error) {
    console.error('Error fetching prayer entries:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch entries' })
  }
})
