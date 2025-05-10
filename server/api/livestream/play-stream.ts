// /server/api/livestream/play-stream.ts
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.userId as string

  if (!userId) {
    throw createError({ statusCode: 400, message: 'Missing userId' })
  }

  const stream = await prisma.liveStream.findUnique({
    where: { userId: parseInt(userId) },
  })

  if (!stream || !stream.playbackUrl) {
    throw createError({ statusCode: 404, message: 'Stream not found or not live' })
  }

  return {
    playbackUrl: stream.playbackUrl,
  }
})
