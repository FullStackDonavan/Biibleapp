import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params || {};
    console.log("🔍 ID from params:", id);

    const userId = parseInt(id, 10);

    if (!userId || isNaN(userId)) {
      console.warn("⚠️ Invalid or missing user ID param:", id);
      throw createError({ statusCode: 400, message: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        liveStream: true, // Ensure liveStream is included
      },
    });

    if (!user) {
      console.log("⚠️ User not found for ID:", userId);
      throw createError({ statusCode: 404, message: "User not found" });
    }

    // Log the details of the liveStream
    if (user.liveStream) {
      console.log("🔴 Live Stream Details:");
      console.log("Channel ARN:", user.liveStream.channelArn);
      console.log("Ingest Endpoint:", user.liveStream.ingestEndpoint);
      console.log("Playback URL:", user.liveStream.playbackUrl);
    } else {
      console.log("⚠️ No live stream found for this user.");
    }

    // Remove sensitive data like password before returning the user data
    const { password, ...safeUser } = user;
    return { user: safeUser, liveStream: user.liveStream || null }; // Return liveStream data to the frontend
  } catch (error) {
    console.error("❌ Error in API handler:", error);
    throw createError({ statusCode: 500, message: error.message || "Server Error" });
  }
});
