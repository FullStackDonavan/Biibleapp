import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "Unauthorized: Invalid token" });
    }

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id },
          { friendId: user.id },
        ],
      },
      include: {
        user: true, // Include details of the user initiating the friendship
        friend: true, // Include details of the friend
      },
    });
    console.log("friends " + friends);

    // Format response
    const formattedFriends = friends.map((friendship) => {
      const isInitiator = friendship.userId === user.id;
      const friendData = isInitiator ? friendship.friend : friendship.user;

      return {
        id: friendData.id,
        firstName: friendData.firstName,
        lastName: friendData.lastName,
        avatar: friendData.avatar || "https://placehold.co/100x100",
      };
    });
    return formattedFriends.length > 0
      ? { success: true, friends: formattedFriends }
      : { success: false, message: "No friends found." };
  } catch (error) {
    console.error("Error fetching friends:", error.message || error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
