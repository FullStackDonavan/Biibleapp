import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    const userIdParam = event.context.params?.id;
    if (!userIdParam) {
      throw createError({ statusCode: 400, message: "User ID is required." });
    }

    const userId = parseInt(userIdParam, 10);
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");

    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const authUser = await getUserByAuthToken(authToken);
    if (!authUser) {
      throw createError({ statusCode: 403, message: "Invalid authentication token." });
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        type: true,
        createdAt: true,
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

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        let imageUrl = null;

        if (post.content && typeof post.content === "object" && post.content.imageId) {
          const image = await prisma.photo.findUnique({
            where: { id: post.content.imageId },
            select: { url: true },
          });

          if (image) {
            imageUrl = image.url;
          }
        }

        return { ...post, imageUrl };
      })
    );

    return { success: true, posts: formattedPosts };
  } catch (error) {
    console.error("❌ Error fetching user posts:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
