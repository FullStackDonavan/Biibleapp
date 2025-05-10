import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!authToken) throw createError({ statusCode: 401, message: 'Missing token' })

    const user = await getUserByAuthToken(authToken)
    if (!user) throw createError({ statusCode: 401, message: 'Invalid token' })

    const groupId = Number(event.context.params.id)
    if (!groupId || isNaN(groupId)) throw createError({ statusCode: 400, message: 'Invalid group ID' })

    // Ensure the group exists
    const group = await prisma.group.findUnique({ where: { id: groupId } })
    if (!group) throw createError({ statusCode: 404, message: 'Group not found' })

    // Create or fetch membership
    const membership = await prisma.groupMember.upsert({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id,
        },
      },
      update: {}, // No updates if already exists
      create: {
        groupId,
        userId: user.id,
        status: 'approved', // Or 'pending' if you want manual approval
        joinedAt: new Date(),
      },
    })

    return { status: membership.status }
  } catch (err: any) {
    console.error('Error in membership-status:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error',
    })
  }
})
