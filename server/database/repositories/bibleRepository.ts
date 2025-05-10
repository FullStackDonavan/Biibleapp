import prisma from "~/server/database/client";

export async function getAllTranslations() {
  return await prisma.translation.findMany({
    select: {
      id: true,
      translation: true,
      title: true,
    },
  });
}

export async function getBooksByTranslation(translationId: number) {
  return await prisma.books.findMany({
    where: {
      translationId,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getChaptersByBook(bookId: number) {
  return await prisma.chapters.findMany({
    where: {
      bookId,
    },
    select: {
      id: true,
      number: true,
    },
  });
}

export async function getVersesByChapter(chapterId: number) {
  return await prisma.verses.findMany({
    where: {
      chapterId,
    },
    select: {
      id: true,
      number: true,
      text: true,
    },
  });
}
