import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!authToken) {
      throw createError({ statusCode: 401, message: 'Unauthorized: Missing token' })
    }

    const user = await getUserByAuthToken(authToken)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Unauthorized: Invalid token' })
    }

    const notes = await prisma.note.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          verse: {
            select: {
              text: true,
              number: true,
              chapter: {
                select: {
                  number: true,
                  book: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      })
      
      return {
        notes: notes.map((note) => ({
          id: note.id,
          content: note.content,
          book: note.verse?.chapter.book.name,
          chapter: note.verse?.chapter.number,
          verse: note.verse?.number,
          text: note.verse?.text,
          createdAt: note.createdAt,
        }))
      }
      

  } catch (error) {
    console.error('Error loading recent notes:', error)
    throw createError({ statusCode: 500, message: 'Failed to load notes' })
  }
})
