import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import prisma from '~/server/database/client'
import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const user = await getUserByAuthToken(authToken)
  if (!user) throw createError({ statusCode: 401, message: 'Invalid user' })

    const likedGames = await prisma.likedGame.findMany({
        where: { userId: user.id },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              path: true,
              book: true,
              theme: true,
              poster: true,
              userId: true, // ✅ include uploader info
              tags: {
                select: { name: true },
              },
            },
          },
        },
      })
      

  return {
    games: likedGames.map((entry) => entry.game),
  }
})
