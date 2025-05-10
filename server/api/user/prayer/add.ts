// server/api/user/prayer/add.ts
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('Request body:', body)

    const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const user = await getUserByAuthToken(authToken)
    console.log('Authenticated user:', user)

    if (!user) throw createError({ statusCode: 401, message: 'Invalid token' })

    const newEntry = await prisma.prayerJournalEntry.create({
      data: {
        userId: user.id,
        text: body.text,
        createdAt: new Date(),
      },
    })

    return { success: true, entry: newEntry }
  } catch (error) {
    console.error('Error adding prayer entry:', error)
    throw createError({ statusCode: 500, message: error.message || 'Failed to add prayer entry' })
  }
})
