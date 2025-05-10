import prisma from "~/server/database/client"

export default defineEventHandler(async () => {
  const verses = await prisma.verses.findMany({
    where: {
      OR: [
        { highlightedVerses: { some: {} } },
        { notes: { some: {} } },
        { places: { some: {} } },
      ],
    },
    include: {
      chapter: {
        include: {
          book: {
            include: {
              translation: true,
            },
          },
        },
      },
      highlightedVerses: true,
      notes: true,
      places: true,
    },
  })

  const ranked = verses
    .map((verse) => {
      const reference = `${verse.chapter.book.name} ${verse.chapter.number}:${verse.number}`
      return {
        id: verse.id,
        text: verse.text,
        reference,
        score:
          (verse.highlightedVerses?.length || 0) +
          (verse.notes?.length || 0) +
          (verse.places?.length || 0),
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return { verses: ranked }
})
