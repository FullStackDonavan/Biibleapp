// server/api/games/index.get.ts
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import prisma from '~/server/database/client'
import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!authToken) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const user = await getUserByAuthToken(authToken)
  if (!user) {
    throw createError({ statusCode: 401, message: 'User not found' })
  }

  const games = await prisma.game.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      path: true,
      poster: true,
      createdAt: true,
    },
  })

  return { success: true, games }
})
