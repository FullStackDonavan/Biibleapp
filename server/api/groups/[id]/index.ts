import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, "authorization")?.replace("Bearer ", "")
  if (!authToken) throw createError({ statusCode: 401, message: "Missing token" })

  const user = await getUserByAuthToken(authToken)
  if (!user) throw createError({ statusCode: 401, message: "Invalid token" })

  const groupId = Number(event.context.params.id)
  if (isNaN(groupId)) throw createError({ statusCode: 400, message: "Invalid group ID" })

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { admin: true } // or members if you want
  })

  if (!group) {
    throw createError({ statusCode: 404, message: "Group not found" })
  }

  return group
})
