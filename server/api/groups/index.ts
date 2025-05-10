import { defineEventHandler } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async () => {
  try {
    const groups = await prisma.group.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        adminId: true,
        // Add any other fields you want
      },
    })

    return groups
  } catch (error) {
    console.error('Error fetching groups:', error)
    return createError({
      statusCode: 500,
      message: 'Error fetching groups',
    })
  }
})
