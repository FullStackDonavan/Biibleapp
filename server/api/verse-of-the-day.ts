// server/api/verse-of-the-day.ts
import { defineEventHandler } from 'h3'
import prisma from "~/server/database/client";

// Optional: pick a verse based on the day
export default defineEventHandler(async () => {
  const today = new Date()
  const seed = today.getDate() + today.getMonth() + today.getFullYear()
  const total = await prisma.verses.count()

  const verse = await prisma.verses.findFirst({
    skip: seed % total,
    include: {
      chapter: {
        include: {
          book: true
        }
      }
    }
  })

  if (!verse) {
    throw createError({ statusCode: 404, message: 'Verse not found' })
  }

  const reference = `${verse.chapter.book.name} ${verse.chapter.number}:${verse.number}`

  return {
    verse: {
      text: verse.text,
      reference,
    }
  }
})
