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

    // Parse request body
    const body = await readBody(event);

    if (!body.content || !body.type) {
      throw createError({ statusCode: 400, message: "Missing required fields." });
    }

    console.log("📥 Incoming Post Data:", body);

    // 🛑 **Fix: Ensure content is an object, not a string**
    let parsedContent;
    try {
      parsedContent = typeof body.content === "string" ? JSON.parse(body.content) : body.content;
    } catch (err) {
      throw createError({ statusCode: 400, message: "Invalid JSON format in content." });
    }

    // Create the post
    const newPost = await prisma.post.create({
      data: {
        userId: user.id,
        type: body.type,
        content: parsedContent, // ✅ Store as JSON object
      },
    });

    console.log("✅ Post Added Successfully:", newPost);

    return { success: true, post: newPost };
  } catch (error) {
    console.error("❌ Error adding post:", error);
    return { success: false, message: error.message || "Server Error" };
  }
});
