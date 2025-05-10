import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    const { chapterId } = getQuery(event);

    if (!chapterId) {
      throw createError({ statusCode: 400, message: "Chapter ID is required" });
    }

    // Get the logged-in user's highlights
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "User not found" });
    }

    // Fetch verses along with user-specific highlights, notes, places, and cross-references
    const verses = await prisma.verses.findMany({
      where: {
        chapterId: Number(chapterId),
      },
      select: {
        id: true,
        number: true,
        text: true,
        cleanText: true,
        transliteration: true,
        translationText: true,
        words: true,
        highlightedVerses: {
          where: { userId: user.id },
          select: {
            highlighted: true,
            color: true,
          },
        },
        places: {
          where: { userId: user.id },
        },
        notes: {
          where: { userId: user.id },
        },
        // ✅ Fetch cross-references for each verse
        fromCrossReferences: {
          select: {
            toVerse: {
              select: {
                id: true,
                number: true,
                text: true,
                chapter: {
                  select: {
                    number: true,
                    book: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
            votes: true, // Optional: if you want to return vote count for popularity
          },
        },
      },
    });

    // Process the verses to include highlight and color data
    const processedVerses = verses.map((verse) => ({
      id: verse.id,
      number: verse.number,
      text: verse.text,
      cleanText: verse.cleanText,
      words: verse.words,
      places: verse.places,
      notes: verse.notes,
      highlighted: verse.highlightedVerses.length > 0 && verse.highlightedVerses[0].highlighted,
      color: verse.highlightedVerses.length > 0 ? verse.highlightedVerses[0].color : "transparent",
      transliteration: verse.transliteration,
      translationText: verse.translationText,
      crossReferences: verse.fromCrossReferences.map((ref) => ({
        book: ref.toVerse.chapter.book.name,
        chapter: ref.toVerse.chapter.number,
        verse: ref.toVerse.number,
        text: ref.toVerse.text,
        votes: ref.votes,
      })),
    }));

    return { verses: processedVerses };
  } catch (error) {
    console.error("❌ Error fetching verses:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
