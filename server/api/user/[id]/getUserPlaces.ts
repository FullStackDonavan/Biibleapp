import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    // Extract userId from URL params
    const userIdParam = event.context.params?.id;
    if (!userIdParam) {
      throw createError({ statusCode: 400, message: "User ID is required." });
    }

    const userId = parseInt(userIdParam, 10);

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

    // Fetch places for the user
    const places = await prisma.place.findMany({
      where: { userId },
      include: {
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
                    translation: { select: { id: true, title: true } },
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
