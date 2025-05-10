import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // ✅ Log the query parameters for debugging
    console.log("📡 Fetching Cross References for:", query);

    // Ensure required parameters are provided
    if (!query.book || !query.chapter || !query.verse) {
      throw new Error("Missing required query parameters: book, chapter, verse.");
    }

    const formattedBook = bookMapping[query.book] || query.book;

    // ✅ Find the "From" verse
    const fromVerse = await prisma.verses.findFirst({
      where: {
        chapter: {
          number: Number(query.chapter),
          book: { name: formattedBook },
        },
        number: Number(query.verse),
      },
    });

    if (!fromVerse) {
      console.warn(`⚠️ No verse found for: ${query.book} ${query.chapter}:${query.verse}`);
      return [];
    }

    // ✅ Fetch related cross-references
    const crossReferences = await prisma.crossReference.findMany({
      where: { fromVerseId: fromVerse.id },
      include: {
        toVerse: {
          include: {
            chapter: {
              include: { book: true },
            },
          },
        },
      },
    });

    // ✅ Transform response to match frontend expectations
    const response = crossReferences.map((ref) => ({
      book: ref.toVerse.chapter.book.name,
      chapter: ref.toVerse.chapter.number,
      verse: ref.toVerse.number,
      votes: ref.votes,
    }));

    console.log("✅ Cross References Retrieved:", response);
    return response;
  } catch (error) {
    console.error("❌ Error fetching cross-references:", error);
    return { error: error.message };
  }
});

// ✅ Book Mapping (Handles Roman Numerals and Name Variations)
const bookMapping: Record<string, string> = {
  "1 Chronicles": "I Chronicles",
  "2 Chronicles": "II Chronicles",
  "1 Corinthians": "I Corinthians",
  "2 Corinthians": "II Corinthians",
  "1 Samuel": "I Samuel",
  "2 Samuel": "II Samuel",
  "1 Kings": "I Kings",
  "2 Kings": "II Kings",
  "Revelation": "Revelation of John",
};
