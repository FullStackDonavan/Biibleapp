import prisma from "~/server/database/client";
import { defineEventHandler, createError } from "h3";

export default defineEventHandler(async () => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: { id: true, username: true, avatar: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" }, // Show newest posts first
    });

    return { success: true, posts };
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    throw createError({ statusCode: 500, message: "Server error" });
  }
});
