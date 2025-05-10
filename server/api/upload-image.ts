import { defineEventHandler, getHeader, readMultipartFormData } from "h3";
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    // Read uploaded file
    const formData = await readMultipartFormData(event);
    const file = formData?.find((item) => item.name === "image");

    if (!file) {
      throw createError({ statusCode: 400, message: "No image uploaded" });
    }

    // Simulated upload URL (Replace with actual storage logic)
    const imageUrl = `https://your-storage-service.com/uploads/${file.filename}`;

    return { success: true, imageUrl };
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    return { success: false, message: error.message || "Upload failed" };
  }
});
