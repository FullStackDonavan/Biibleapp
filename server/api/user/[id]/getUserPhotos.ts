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

   

    // Fetch photos for the user
    const photos = await prisma.photo.findMany({
      where: { userId },
      select: {
        id: true,
        url: true,
        createdAt: true,
      },
    });

    // Return the photos
    return { success: true, photos };
  } catch (error) {
    console.error("Error fetching photos:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
