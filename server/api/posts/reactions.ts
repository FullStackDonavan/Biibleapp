import { defineEventHandler, getHeader, readBody } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    console.log("🟢 Incoming request to /api/posts/reactions");

    // Extract auth token
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      console.error("❌ Missing auth token");
      throw createError({ statusCode: 401, message: "Unauthorized: Missing token" });
    }

    // Extract request body
    const { postId, reactionType } = await readBody(event);
    console.log("🔍 Received request body:", { postId, reactionType });

    if (!postId || !reactionType) {
      console.error("❌ Missing postId or reactionType");
      throw createError({ statusCode: 400, message: "Missing postId or reactionType" });
    }

    // Fetch user by auth token
    const session = await prisma.session.findUnique({
      where: { authToken },
      select: { userId: true },
    });

    if (!session) {
      console.error("❌ Invalid session or user not found");
      throw createError({ statusCode: 401, message: "Invalid session or user not found" });
    }

    console.log("✅ User found:", session.userId);

    // Check if user already reacted
    const existingReaction = await prisma.reaction.findFirst({
      where: { userId: session.userId, postId: postId }
    });

    console.log("🔍 Existing reaction:", existingReaction);

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        // ✅ Remove reaction
        console.log("🗑 Removing reaction...");
        await prisma.$transaction([
          prisma.reaction.deleteMany({
            where: { userId: session.userId, postId: postId },
          }),
          prisma.post.update({
            where: { id: postId },
            data: { totalReactions: { decrement: 1 } },
          }),
        ]);
        console.log("✅ Reaction removed");
        return { success: true, message: "Reaction removed", totalReactions: -1 };
      } else {
        // ✅ Update reaction type
        console.log("🔄 Updating reaction...");
        await prisma.reaction.updateMany({
          where: { userId: session.userId, postId: postId },
          data: { type: reactionType }
        });

        console.log("✅ Reaction updated");
        return { success: true, message: "Reaction updated", totalReactions: 0 };
      }
    } else {
      // ✅ Create new reaction
      console.log("➕ Adding new reaction...");
      await prisma.$transaction([
        prisma.reaction.create({
          data: {
            type: reactionType,
            user: { connect: { id: session.userId } }, // ✅ Connect user
            post: { connect: { id: postId } }, // ✅ Connect post
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { totalReactions: { increment: 1 } },
        }),
      ]);

      console.log("✅ New reaction added");
      return { success: true, message: "Reaction added", totalReactions: 1 };
    }
  } catch (error) {
    console.error("❌ Server error in /api/posts/reactions:", error);
    return { success: false, message: "Server error", details: error.message };
  }
});
