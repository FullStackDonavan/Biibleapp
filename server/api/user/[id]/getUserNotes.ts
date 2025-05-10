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

    // Optional: Validate the authentication token
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const authenticatedUser = await getUserByAuthToken(authToken);
    if (!authenticatedUser) {
      throw createError({ statusCode: 401, message: "User not found" });
    }

    // Fetch notes for the user
    const notes = await prisma.note.findMany({
      where: {
        userId: userId, // Use the userId extracted from params
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        verseId: true,
      },
    });

    return { success: true, notes };
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
