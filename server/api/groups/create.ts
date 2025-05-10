import { defineEventHandler, getHeader, createError, readBody } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: true },
  })

  if (!session?.user) throw createError({ statusCode: 401, message: 'Invalid user' })

  const body = await readBody(event)
  const { name, description, visibility } = body

  if (!name || !description || !visibility) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  const newGroup = await prisma.group.create({
    data: {
      name,
      description,
      visibility,
      adminId: session.user.id,
    },
  })

  return { success: true, group: newGroup }
})
