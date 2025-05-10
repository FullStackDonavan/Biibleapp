// server/api/games/like.ts
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import prisma from '~/server/database/client'
import { readBody, getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const user = await getUserByAuthToken(token)
  if (!user) throw createError({ statusCode: 401, message: 'Invalid user' })

  const { gameId, like } = await readBody(event)
  if (!gameId || typeof like !== 'boolean') {
    throw createError({ statusCode: 400, message: 'Missing or invalid gameId/like' })
  }

  if (like) {
    await prisma.likedGame.upsert({
      where: {
        userId_gameId: { userId: user.id, gameId },
      },
      update: {},
      create: {
        userId: user.id,
        gameId,
      },
    })
  } else {
    await prisma.likedGame.deleteMany({
      where: {
        userId: user.id,
        gameId,
      },
    })
  }

  return { success: true }
})
