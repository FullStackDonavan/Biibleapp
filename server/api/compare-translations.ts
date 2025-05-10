import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const { bookId, chapterNumber, verseNumber } = getQuery(event)

  const translations = await prisma.translation.findMany({
    include: {
      books: {
        where: { id: Number(bookId) },
        include: {
          chapters: {
            where: { number: Number(chapterNumber) },
            include: {
              verses: {
                where: { number: Number(verseNumber) }
              }
            }
          }
        }
      }
    }
  })

  const verses = []
  let bookName = ''

  for (const translation of translations) {
    const book = translation.books[0]
    const chapter = book?.chapters[0]
    const verse = chapter?.verses[0]

    if (verse) {
      verses.push({
        translationId: translation.id,
        translationTitle: translation.title,
        text: verse.text
      })
    }

    if (!bookName && book?.name) bookName = book.name
  }

  return { verses, bookName }
})
