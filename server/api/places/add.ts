import prisma from "~/server/database/client";
import { getUserByAuthToken } from "~/server/database/repositories/sessionRepository";

export default defineEventHandler(async (event) => {
  try {
    const { verseId, name, location } = await readBody(event);

    if (!verseId || !name) {
      throw createError({ statusCode: 400, message: "Verse ID and place name are required" });
    }

    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const user = await getUserByAuthToken(authToken);
    if (!user) {
      throw createError({ statusCode: 401, message: "User not found" });
    }

    const place = await prisma.place.upsert({
      where: {
        userId_verseId_name: {
          userId: user.id,
          verseId: parseInt(verseId, 10),
          name,
        },
      },
      update: { location },
      create: {
        userId: user.id,
        verseId: parseInt(verseId, 10),
        name,
        location: location || null, // Optional field
      },
    });

    return { success: true, place };
  } catch (error) {
    console.error("Error adding place:", error);
    throw createError({ statusCode: 500, message: "Server Error" });
  }
});
