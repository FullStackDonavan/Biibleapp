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

    const highlights = await prisma.highlightedVerse.findMany({
      where: { userId: user.id, highlighted: true },
      orderBy: { id: "desc" },
      take: 10,
      include: {
        verse: {
          select: {
            text: true,
            number: true,
            chapter: {
              select: {
                number: true,
                book: {
                  select: {
                    name: true,
                    translation: {
                      select: {
                        title: true, // only selecting what’s needed
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return {
      highlights: highlights.map((h) => ({
        id: h.id,
        text: h.verse.text,
        book: h.verse.chapter.book.name,
        chapter: h.verse.chapter.number,
        verse: h.verse.number,
        translation: h.verse.chapter.book.translation.title,
        color: h.color,
        highlightedAt: h.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching recent highlights:", error);
    throw createError({ statusCode: 500, message: error.message || "Failed to fetch recent highlights" });
  }
});
