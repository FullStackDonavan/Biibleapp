// adUtils.ts - Utility file for handling ad selection and impressions

import prisma from '~/server/database/client';

export const getNextAdBasedOnImpressions = async () => {
  // Retrieve all active ads sorted by their impressions (ascending order)
  const ads = await prisma.ad.findMany({
    where: {
      status: 'active', // Only select active ads
    },
    orderBy: {
      impressions: 'asc', // Sort ads by their impression count in ascending order
    },
  });

  if (ads.length === 0) {
    throw new Error('No active ads available');
  }

  // Select the ad with the least impressions
  const nextAd = ads[0];  // First ad in the sorted list (lowest impressions)
  
  // Update impressions for the selected ad
  await prisma.ad.update({
    where: { id: nextAd.id },
    data: { impressions: nextAd.impressions + 1 }, // Increment impressions count
  });

  return nextAd; // Return the selected ad for use
};
