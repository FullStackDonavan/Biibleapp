import prisma from "~/server/database/client";
import { getQuery } from "h3";

export default defineEventHandler(async (event) => {
  try {
    // Extract user ID from the request parameters
    const userIdParam = event.context.params?.id;
    const { chapterId } = getQuery(event);
    const userId = parseInt(userIdParam, 10);
    
    // Validate input parameters
    if (!chapterId) {
      throw createError({ statusCode: 400, message: "Chapter ID is required" });
    }

    if (!userIdParam) {
      
      throw createError({ statusCode: 400, message: "User ID is required" });
    }

    // Fetch verses along with user-specific highlights and colors
    const verses = await prisma.verses.findMany({
      where: { chapterId: parseInt(chapterId, 10) },
      include: {
        highlightedVerses: {
          where: {userId},
          select: { highlighted: true, color: true },
        },
        places:
        {
          where: { userId: userId },
        },
        notes:{
          where: { userId: userId }
        },
      },
    });

    // Process the verses to include highlight and color data
    const processedVerses = verses.map((verse) => ({
      id: verse.id,
      number: verse.number,
      text: verse.text,
      places: verse.places,
      notes: verse.notes,
      highlighted: verse.highlightedVerses.length > 0 && verse.highlightedVerses[0].highlighted,
      color: verse.highlightedVerses.length > 0 ? verse.highlightedVerses[0].color : "transparent", // Default to 'transparent'
    }));

    return { verses: processedVerses };
  } catch (error) {
    console.error("Error fetching user-specific verses:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
