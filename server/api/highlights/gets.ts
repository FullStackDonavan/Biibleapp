import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const { userId } = getQuery(event);
  if (!userId) {
    throw createError({ statusCode: 400, message: "User ID is required" });
  }

  const highlightedVerses = await prisma.highlightedVerse.findMany({
    where: { userId: Number(userId) },
    select: { verseId: true },
  });

  return { highlightedVerses };
});
