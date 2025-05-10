import { getAllTranslations } from "~/server/database/repositories/bibleRepository";

export default defineEventHandler(async () => {
  try {
    const translations = await getAllTranslations();
    return { translations };
  } catch (error) {
    console.error("Error fetching translations:", error);
    throw createError({ statusCode: 500, message: "Unable to fetch translations" });
  }
});
