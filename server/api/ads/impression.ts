// impression.ts - API endpoint to handle ad impressions

import { createError } from 'h3';
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository';
import { getNextAdBasedOnImpressions } from '~/server/api/ads/adUtils'; // Import the function
import prisma from '~/server/database/client';

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const user = await getUserByAuthToken(token);
  if (!user) throw createError({ statusCode: 401, message: 'Invalid user' });

  const { gameId } = await readBody(event);
  if (!gameId) throw createError({ statusCode: 400, message: 'Missing gameId' });

  console.log('Received ad impression request:', { userId: user.id, gameId });

  try {
    // Get the next ad based on impressions
    const nextAd = await getNextAdBasedOnImpressions();

    // Create the ad impression record
    await prisma.adImpression.create({
      data: {
        userId: user.id,
        gameId,
        adId: nextAd.id, // Associate the ad with the impression
      },
    });

    console.log('Ad impression created successfully for userId:', user.id, 'gameId:', gameId);
    return { success: true };
  } catch (error) {
    console.error('Error creating ad impression:', error);
    throw createError({ statusCode: 500, message: 'Error creating ad impression' });
  }
});
