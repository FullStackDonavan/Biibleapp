import { defineEventHandler, createError, readBody, H3Event, getHeader } from "h3";
import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Extract the authorization token
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    // Fetch the user
    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });
    }

    // Read the request body (image URL)
    const { imageUrl } = await readBody(event);
    if (!imageUrl) {
      throw createError({ statusCode: 400, message: "Missing image URL" });
    }

    // Save the photo in the database
    const savedPhoto = await prisma.photo.create({
      data: {
        userId: user.id,
        url: imageUrl, // Save the generated image URL
        createdAt: new Date(),
      },
    });

    return { success: true, photos: [savedPhoto] };
  } catch (error: any) {
    console.error("Error saving photo:", error);
    throw createError({ statusCode: 500, message: error.message || "Server Error" });
  }
});
