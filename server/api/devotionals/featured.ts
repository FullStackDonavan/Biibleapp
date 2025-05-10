import prisma from "~/server/database/client";
import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  try {
    // ✅ Fetch the most recent devotional
    const devotional = await prisma.devotional.findFirst({
      orderBy: {
        date: 'desc',
      },
      select: {
        id: true,
        title: true,
        content: true,
        date: true,
      },
    })

    if (!devotional) {
      return { devotional: null }
    }

    // ✂️ Generate snippet from content
    const snippet = devotional.content.slice(0, 160) + (devotional.content.length > 160 ? '...' : '')

    return {
      devotional: {
        id: devotional.id,
        title: devotional.title,
        snippet,
        date: devotional.date,
      },
    }
  } catch (error) {
    console.error('❌ Error fetching featured devotional:', error)
    return { devotional: null }
  }
})
