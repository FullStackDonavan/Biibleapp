import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    // Extract user ID from params
    const userId = parseInt(event.context.params?.id || "", 10);
    if (isNaN(userId)) {
      console.error("Invalid user ID:", event.context.params?.id);
      throw createError({ statusCode: 400, message: "Invalid user ID" });
    }
    console.log("Received User ID:", userId);

    // Get auth token
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      console.error("Missing authorization token");
      throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    // Validate token and retrieve the current user
    const currentUser = await getUserByAuthToken(authToken);
    if (!currentUser) {
      console.error("Invalid token or user not found");
      throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });
    }
    console.log("Current User ID:", currentUser.id);

    // Check if friendship exists
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUser.id, friendId: userId },
          { userId: userId, friendId: currentUser.id },
        ],
      },
    });

    console.log("Friendship status:", !!friendship);
    return { isFriend: !!friendship };
  } catch (error) {
    console.error("Error checking friend status:", error);
    throw createError({ statusCode: 500, message: "Failed to check friend status" });
  }
});
