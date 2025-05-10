
// server/api/ads/getGameAd.js
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  try {
    const ads = await prisma.ad.findMany({
      where: {
        placement: 'game_banner', // Filter by game banner placement
        status: 'active', // Only active ads
      },
    })

    return ads
  } catch (error) {
    console.error('❌ Error fetching ads:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch ads' })
  }
})
