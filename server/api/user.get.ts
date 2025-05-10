import { defineEventHandler, getHeader } from "h3";
import { getUserByAuthToken } from "~~/server/app/services/sessionService";

export default defineEventHandler(async (event) => {
  try {
    // Extract the Authorization header
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) {
      throw createError({ statusCode: 401, message: "Missing authorization token" });
    }

    // Fetch the user by authToken
    const user = await getUserByAuthToken(authToken);
    console.log("user? :", user);

    // Return the user object directly
    return { success: true, user }; 
  } catch (error: any) {
    console.error("Error in /api/user endpoint:", error.message || error);
    throw createError({ statusCode: error.statusCode || 500, message: error.message || "Server Error" });
  }
});
