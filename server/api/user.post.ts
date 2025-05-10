import { defineEventHandler, readBody, getHeader, createError } from "h3";
import prisma from "~/server/database/client"; // Ensure your Prisma client is correctly imported
import { getUserByAuthToken } from "~/server/app/services/sessionService";

export default defineEventHandler(async (event) => {
  try {
    // Read the request body
    const updatedUserData = await readBody(event);

    // Extract the Authorization header
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Missing authorization token" });
    }

    // Get the user by token
    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    // Update the user's data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: updatedUserData.firstName,
        lastName: updatedUserData.lastName,
        email: updatedUserData.email,
        phone: updatedUserData.phone,
        location: updatedUserData.location,
        bio: updatedUserData.bio,
      },
    });

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error in user.post.ts:", error.message || error);
    throw createError({ statusCode: 500, message: "Failed to update user profile." });
  }
});
