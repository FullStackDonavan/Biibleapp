import { defineEventHandler, createError, H3Event, getHeader } from "h3";
import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Extract the authorization token from the request header
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    // Fetch the user associated with the token
    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });
    }

    // Fetch photos belonging to the user
    const photos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Return the photos
    return { photos };
  } catch (error: any) {
    console.error("Error fetching photos:", error);
    throw createError({ statusCode: 500, message: error.message || "Server Error" });
  }
});
