// server/api/verse.ts
import { getQuery } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { book, chapter, verse } = query

  if (!book || !chapter || !verse) {
    return { error: 'Missing book, chapter, or verse' }
  }

  // Get default translation (or customize if needed)
  const translation = await prisma.translation.findFirst()

  if (!translation) {
    return { error: 'No Bible translation found.' }
  }

  const foundBook = await prisma.books.findFirst({
    where: {
      name: String(book),
      translationId: translation.id,
    },
  })

  if (!foundBook) {
    return { error: `Book "${book}" not found.` }
  }

  const foundChapter = await prisma.chapters.findFirst({
    where: {
      number: Number(chapter),
      bookId: foundBook.id,
    },
  })

  if (!foundChapter) {
    return { error: `Chapter ${chapter} not found in ${book}.` }
  }

  const foundVerse = await prisma.verses.findFirst({
    where: {
      chapterId: foundChapter.id,
      number: Number(verse),
    },
    select: {
      text: true,
      number: true,
    },
  })

  if (!foundVerse) {
    return { error: `Verse ${verse} not found in ${book} ${chapter}.` }
  }

  return {
    verse: {
      book,
      chapter: Number(chapter),
      verse: foundVerse.number,
      text: foundVerse.text,
    },
  }
})
