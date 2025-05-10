import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    // Extract user ID from the request parameters
    const userIdParam = event.context.params?.id;

    // Check if the request is authenticated
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");

    // If fetching for another user (not logged-in user), bypass token check
    if (!authToken && userIdParam) {
      const userId = parseInt(userIdParam, 10);
      const highlights = await prisma.highlightedVerse.findMany({
        where: { userId, highlighted: true },
        include: {
          verse: {
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
            },
          },
        },
      });

      return {
        highlights: highlights.map((h) => ({
          id: h.id,
          text: h.verse.text,
          book: h.verse.chapter.book.name,
          chapter: h.verse.chapter.number,
          verse: h.verse.number,
          translation: h.verse.chapter.book.translation.title,
          color: h.color,
        })),
      };
    }

    // Validate token for logged-in user
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    const authenticatedUser = await getUserByAuthToken(authToken);
    if (!authenticatedUser) {
      throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });
    }

    // Fetch highlights for the logged-in user
    const userId = userIdParam ? parseInt(userIdParam, 10) : authenticatedUser.id;
    const highlights = await prisma.highlightedVerse.findMany({
      where: { userId, highlighted: true },
      include: {
        verse: {
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
          },
        },
      },
    });

    return {
      highlights: highlights.map((h) => ({
        id: h.id,
        text: h.verse.text,
        book: h.verse.chapter.book.name,
        chapter: h.verse.chapter.number,
        verse: h.verse.number,
        translation: h.verse.chapter.book.translation.title,
        color: h.color,
      })),
    };
  } catch (error) {
    console.error("Error fetching highlights:", error);
    throw createError({ statusCode: 500, message: error.message || "Failed to load highlights" });
  }
});
