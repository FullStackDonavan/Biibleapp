// server/api/user/summary.ts
import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!authToken) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const user = await getUserByAuthToken(authToken)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Invalid token' })
    }

    const [highlightCount, noteCount, placeCount] = await Promise.all([
      prisma.highlightedVerse.count({ where: { userId: user.id } }),
      prisma.note.count({ where: { userId: user.id } }),
      prisma.place.count({ where: { userId: user.id } }),
    ])

    return {
      totalHighlights: highlightCount,
      totalNotes: noteCount,
      totalPlaces: placeCount,
      userId: user.id,
    }
  } catch (error) {
    console.error('Error fetching user summary:', error)
    throw createError({ statusCode: 500, message: 'Something went wrong while fetching summary' })
  }
})
