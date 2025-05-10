import { createError } from 'h3'
import prisma from '~/server/database/client'  // Correct import of prisma client

export default defineEventHandler(async (event) => {
    const { title, mediaUrl, mediaType, placement, targeting, status, ctaUrl, duration } = await readBody(event)
  
    // Ensure all required fields are present, but make ctaUrl optional
    if (!title || !mediaUrl || !mediaType || !placement || (mediaType === 'video' && !ctaUrl)) {
      console.error('❌ Missing required fields:', {
        title,
        mediaUrl,
        mediaType,
        placement,
        ctaUrl,
      })
      throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    // Ensure targeting is an empty object if not provided
    const adData = {
      title,
      media_url: mediaUrl,  // Correct field name
      media_type: mediaType,  // Correct field name
      placement,
      targeting: targeting || {},  // If targeting is not provided, use an empty object
      status,
      cta_url: ctaUrl || '',  // Make it optional (can be empty)
      duration: mediaType === 'video' ? duration : null,  // Only set duration for video ads
    }

    try {
      const ad = await prisma.ad.create({
        data: adData,
      })
  
      console.log('✅ Ad created:', ad)
      return { success: true, ad }
    } catch (error) {
      console.error('❌ Error creating ad:', error)
      throw createError({ statusCode: 500, message: 'Failed to create ad' })
    }
  })

