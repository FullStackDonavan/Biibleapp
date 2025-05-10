import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "")
    if (!authToken) throw createError({ statusCode: 401, message: "Missing token" })

    const user = await getUserByAuthToken(authToken)
    if (!user) throw createError({ statusCode: 401, message: "Invalid token" })

    const stream = await prisma.liveStream.findUnique({
      where: { userId: user.id }
    })

    if (!stream) {
      throw createError({ statusCode: 404, message: "Live stream not found. Please create one first." })
    }

    return {
      streamKey: stream.streamKey,
      ingestEndpoint: stream.ingestEndpoint,
      playbackUrl: stream.playbackUrl
    }

  } catch (err) {
    console.error("🔥 Error in /api/livestream/go-live:", err)
    throw createError({ statusCode: 500, message: "Internal Server Error" })
  }
})
