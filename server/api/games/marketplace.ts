// server/api/games/marketplace.ts
import prisma from '~/server/database/client'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { book, theme, tag, sort } = query

  const where: any = {}

  if (book) where.book = book
  if (theme) where.theme = theme
  if (tag) {
    where.tags = {
      some: {
        name: tag, // 'name' should match your Tag model's field
      }
    }
  }

  const orderBy = sort === 'popular'
    ? { createdAt: 'desc' } // fallback until views are added
    : { createdAt: 'desc' }

    const games = await prisma.game.findMany({
        where,
        orderBy,
        take: 50,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          path: true,
          book: true,
          theme: true,
          poster: true,
          createdAt: true,
          userId: true,
          tags: {
            select: {
              name: true,
            },
          },
        },
      })
      
      

  return { success: true, games }
})
