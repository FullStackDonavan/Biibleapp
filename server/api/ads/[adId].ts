import prisma from '~/server/database/client';

export default defineEventHandler(async (event) => {
    const adId = getRouterParam(event, 'adId');
  
    if (!adId) {
      throw createError({ statusCode: 400, statusMessage: 'Ad ID is required' });
    }
  
    try {
      const ad = await prisma.ad.findUnique({
        where: { id: Number(adId) }, // Ensure adId is a number if required by your DB
      });
  
      if (!ad) {
        throw createError({ statusCode: 404, statusMessage: 'Ad not found' });
      }
  
      return ad;
    } catch (error) {
      console.error('Error fetching ad details:', error);
      throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
    }
  });
  
