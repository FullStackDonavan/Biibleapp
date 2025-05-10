import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    const { verseId } = getQuery(event);

    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "User not found" });
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        verseId: verseId ? parseInt(verseId, 10) : undefined,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        verseId: true,
      },
    });

    return { success: true, notes };
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
