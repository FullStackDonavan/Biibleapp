import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const idParam = event.context.params?.id;
    const userId = parseInt(idParam, 10);

    if (isNaN(userId) || userId <= 0) {
      throw createError({ statusCode: 400, message: "Invalid user ID" });
    }

    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    const currentUser = await getUserByAuthToken(authToken);
    if (!currentUser) {
      throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUser.id, friendId: userId },
          { userId: userId, friendId: currentUser.id },
        ],
      },
    });

    if (existingFriendship) {
      return { message: "Friendship already exists" };
    }

    // Create a new friendship
    await prisma.friendship.create({
      data: {
        userId: currentUser.id,
        friendId: userId,
      },
    });

    return { message: "Friend added successfully" };
  } catch (error) {
    console.error("Error handling friend request:", error);
    throw createError({ statusCode: error.statusCode || 500, message: error.message || "Server error" });
  }
});
