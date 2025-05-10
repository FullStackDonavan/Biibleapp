import { defineEventHandler, getHeader, createError, readMultipartFormData } from 'h3'
import prisma from '~/server/database/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'

// AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const BUCKET = process.env.AWS_S3_BUCKET!
const REGION = process.env.AWS_S3_REGION!

export default defineEventHandler(async (event) => {
  try {
    // 🛡️ Get & validate auth
    const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const user = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    })
    if (!user || !user.user) throw createError({ statusCode: 401, message: 'Invalid user' })

    // 📤 Read file
    const formData = await readMultipartFormData(event)
    const videoFile = formData.find((item) => item.name === 'video')
    if (!videoFile) throw createError({ statusCode: 400, message: 'No video file found' })

    // 📦 Upload video to S3
    const ext = videoFile.filename.split('.').pop()
    const key = `videos/${Date.now()}-${nanoid()}.${ext}`

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: videoFile.data,
        ContentType: videoFile.type,
      })
    )

    const videoUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`

    // 💾 Save to DB (Video + Post)
    const newVideo = await prisma.video.create({
      data: {
        user: { connect: { id: user.user.id } },
        videoUrl,
        description: 'Video description here',
        duration: 1200, // seconds (optional: you could detect it client-side)
      },
    })

    const videoMetadata = {
      videoUrl,
      description: 'Video description here',
      duration: 120,
      text: 'Test',
    }

    const newPost = await prisma.post.create({
      data: {
        user: { connect: { id: user.user.id } },
        type: 'video',
        content: videoMetadata,
      },
    })

    return { success: true, post: newPost, video: newVideo }
  } catch (error: any) {
    console.error('❌ Error in /api/posts/upload:', error)
    throw createError({ statusCode: 500, message: error.message || 'Post upload failed' })
  }
})
