import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    // Extract query parameters if needed (e.g., filtering by verseId)
    const { verseId } = getQuery(event);

    // Get the auth token from the request header
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    // Get the logged-in user using the auth token
    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "User not found" });
    }

    // Fetch places for the user, optionally filtered by verseId
    const places = await prisma.place.findMany({
      where: {
        userId: user.id,
        verseId: verseId ? parseInt(verseId, 10) : undefined,
      },
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
        verse: {
          select: {
            id: true,
            number: true,
            text: true,
            chapter: {
              select: {
                id: true,
                number: true,
                book: {
                  select: {
                    id: true,
                    name: true,
                    translation: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Return the places
    return { success: true, places };
  } catch (error) {
    console.error("Error fetching places:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
