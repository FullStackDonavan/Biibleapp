import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 403, message: "Invalid authentication token." });
    }

    // Fetch user's posts including reactions
    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        content: true, // ✅ JSON content stored here
        type: true,
        createdAt: true,
        totalReactions: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        reactions: {
          select: {
            type: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ Fetch image URLs based on `imageId`
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        let imageUrl = null;

        if (post.content && typeof post.content === "object" && post.content.imageId) {
          const image = await prisma.photo.findUnique({
            where: { id: post.content.imageId },
            select: { url: true },
          });

          if (image) {
            imageUrl = image.url; // ✅ Retrieve the actual URL from the database
          }
        }

        return { ...post, imageUrl }; // ✅ Attach `imageUrl` to response
      })
    );

    return { success: true, posts: formattedPosts };
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return { success: false, message: "Server Error" };
  }
});
