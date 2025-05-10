import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const translationId = Number(query.translationId);

  if (!translationId) {
    console.error("❌ translationId is missing or invalid:", query.translationId);
    throw createError({ statusCode: 400, message: "translationId is required" });
  }

  console.log("📖 Fetching books for translationId:", translationId);

  try {
    const books = await prisma.books.findMany({
      where: {
        translationId, // Ensure this column exists in the DB
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log("✅ Books found:", books);

    if (books.length === 0) {
      console.warn("⚠️ No books found for translationId:", translationId);
    }

    return { books };
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    throw createError({ statusCode: 500, message: "Database error" });
  }
});
