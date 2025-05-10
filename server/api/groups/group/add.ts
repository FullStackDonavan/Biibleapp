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

    const body = await readBody(event);

    if (!body.groupId || !body.type || !body.content) {
      throw createError({ statusCode: 400, message: "Missing required fields: groupId, type, content" });
    }

    console.log("📥 Incoming GroupPost Data:", body);

    let parsedContent;
    try {
      parsedContent = typeof body.content === "string" ? JSON.parse(body.content) : body.content;
    } catch (err) {
      throw createError({ statusCode: 400, message: "Invalid JSON format in content." });
    }

    const newGroupPost = await prisma.groupPost.create({
      data: {
        userId: user.id,
        groupId: body.groupId,
        type: body.type,
        content: parsedContent,
      },
    });

    console.log("✅ GroupPost Added Successfully:", newGroupPost);

    return { success: true, post: newGroupPost };
  } catch (error) {
    console.error("❌ Error adding group post:", error);
    return { success: false, message: error.message || "Server Error" };
  }
});
