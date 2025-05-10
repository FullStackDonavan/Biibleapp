import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    const { verseId, content } = await readBody(event);

    if (!verseId || !content) {
      throw createError({ statusCode: 400, message: "Verse ID and content are required" });
    }

    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "User not found" });
    }

    const note = await prisma.note.upsert({
      where: {
        userId_verseId: {
          userId: user.id,
          verseId: parseInt(verseId, 10),
        },
      },
      update: { content },
      create: {
        userId: user.id,
        verseId: parseInt(verseId, 10),
        content,
      },
    });

    return { success: true, note };
  } catch (error) {
    console.error("Error adding note:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
