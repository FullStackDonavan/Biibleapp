import { defineEventHandler, getHeader, createError } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const groupIdParam = event.context.params?.id
  if (!groupIdParam || isNaN(Number(groupIdParam))) {
    throw createError({ statusCode: 400, message: 'Invalid groupId' })
  }

  const groupId = Number(groupIdParam)

  const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: true },
  })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Invalid session' })
  }

  const photos = await prisma.groupPhoto.findMany({
    where: { groupId },
    orderBy: { createdAt: 'desc' },
  })

  return photos
})
