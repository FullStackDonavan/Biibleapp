// server/api/ads.ts

import { defineEventHandler, readBody } from 'h3';
import prisma from '~/server/database/client'; // Adjust based on where your Prisma client is

// Define the route handler
export default defineEventHandler(async (event) => {
  // Optional: Check for authorization (e.g., JWT token validation)
  const token = event.req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized access',
    });
  }

  try {
    // Fetch ads from the database
    const ads = await prisma.ad.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        created_at: 'desc',  // Change this
      },
    });
    

    // Return the ads data
    return ads;
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch ads from database',
    });
  }
});
