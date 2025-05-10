import {
  IvsClient,
  CreateChannelCommand
} from '@aws-sdk/client-ivs'

import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

const ivs = new IvsClient({ region: 'us-east-1' })

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "")
    if (!authToken) throw createError({ statusCode: 401, message: "Missing token" })

    const user = await getUserByAuthToken(authToken)
    if (!user) throw createError({ statusCode: 401, message: "Invalid token" })

    // Check if user already has a stream
    const existingStream = await prisma.liveStream.findUnique({
      where: { userId: user.id }
    })

    if (existingStream) {
      return {
        message: "Live stream already exists",
        stream: {
          streamKey: existingStream.streamKey,
          ingestEndpoint: existingStream.ingestEndpoint,
          playbackUrl: existingStream.playbackUrl
        }
      }
    }

    // Create IVS channel with automatic default stream key
    const channelRes = await ivs.send(new CreateChannelCommand({
      name: `user-${user.id}`,
      latencyMode: 'LOW',
      type: 'STANDARD',
      authorized: false
    }))

    const channel = channelRes.channel
    const streamKey = channelRes.streamKey?.value
    const channelArn = channel?.arn

    // Debug log
    console.log('channelArn:', channelArn)
    console.log('streamKey:', streamKey)

    // Check that everything was returned correctly
    if (!channel || !channelArn || !streamKey) {
      throw createError({ statusCode: 500, message: "Failed to create IVS channel or retrieve stream key" })
    }

    // Save to DB
    const newStream = await prisma.liveStream.create({
      data: {
        userId: user.id,
        channelArn,
        streamKey,
        ingestEndpoint: channel.ingestEndpoint!,
        playbackUrl: channel.playbackUrl!
      }
    })

    return {
      message: "Live stream created successfully",
      stream: {
        streamKey: newStream.streamKey,
        ingestEndpoint: newStream.ingestEndpoint,
        playbackUrl: newStream.playbackUrl
      }
    }

  } catch (err) {
    console.error("🔥 Error in /api/livestream/create:", err)
    throw createError({ statusCode: 500, message: "Internal Server Error" })
  }
})
