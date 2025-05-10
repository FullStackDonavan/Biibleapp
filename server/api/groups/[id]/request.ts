import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, "authorization")?.replace("Bearer ", "")
  if (!authToken) throw createError({ statusCode: 401, message: "Missing token" })

  const user = await getUserByAuthToken(authToken)
  if (!user) throw createError({ statusCode: 401, message: "Invalid token" })

  const groupId = Number(event.context.params.id)

  const existing = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } }
  })

  if (existing) {
    return { status: existing.status }
  }

  await prisma.groupMembership.create({
    data: {
      groupId,
      userId: user.id,
      status: 'pending'
    }
  })

  return { status: 'requested' }
})
