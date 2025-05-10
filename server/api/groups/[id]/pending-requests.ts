import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, "authorization")?.replace("Bearer ", "")
  if (!authToken) throw createError({ statusCode: 401, message: "Missing token" })

  const user = await getUserByAuthToken(authToken)
  if (!user) throw createError({ statusCode: 401, message: "Invalid token" })

  const groupId = Number(event.context.params.id)

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group || group.adminId !== user.id) {
    throw createError({ statusCode: 403, message: "Forbidden" })
  }

  const requests = await prisma.groupMembership.findMany({
    where: { groupId, status: 'pending' },
    include: { user: { select: { id: true, name: true } } }
  })

  return requests
})
