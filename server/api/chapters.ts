import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const bookId = Number(query.bookId);

  if (!bookId) {
    throw createError({ statusCode: 400, message: "bookId is required" });
  }

  const chapters = await prisma.chapters.findMany({
    where: {
      bookId,
    },
    select: {
      id: true,
      number: true,
    },
  });

  return { chapters };
});
