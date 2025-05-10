// server/api/livestream/status.ts
import prisma from '~/server/database/client'
import { IvsClient, GetStreamCommand } from '@aws-sdk/client-ivs'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string

    if (!userId) {
      throw createError({ statusCode: 400, message: 'Missing userId in query' })
    }

    const stream = await prisma.liveStream.findUnique({
      where: { userId: parseInt(userId) },
    })

    if (!stream) {
      throw createError({ statusCode: 404, message: 'Stream not found' })
    }

    const ivsClient = new IvsClient({ region: 'us-east-1' })
    const command = new GetStreamCommand({ channelArn: stream.channelArn })

    try {
      const ivsData = await ivsClient.send(command)

      return {
        state: 'Online',
        health: 'Good', // IVS doesn't provide detailed health; you can customize based on bitrates, etc.
        // duration: new Date().getTime() - new Date(ivsData.stream?.startTime || '').getTime() + ' ms',
        viewers: ivsData.stream?.viewerCount || 0
      }
    } catch (err: any) {
      if (err.name === 'ResourceNotFoundException') {
        return {
          state: 'Offline',
          health: 'N/A',
          duration: '0',
          viewers: 0
        }
      } else {
        throw err
      }
    }
  } catch (err) {
    console.error("🔥 Error in /api/livestream/status:", err)
    throw createError({ statusCode: 500, message: "Internal Server Error" })
  }
})
