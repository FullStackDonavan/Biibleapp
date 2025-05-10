import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import prisma from '~/server/database/client'
import { readMultipartFormData, getHeader, createError } from 'h3'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import AdmZip from 'adm-zip'
import { nanoid } from 'nanoid'
import mime from 'mime-types'

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET!

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!authToken) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const user = await getUserByAuthToken(authToken)
  if (!user) throw createError({ statusCode: 401, message: 'Invalid user' })

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, message: 'Form data missing' })

  const getField = (name: string) => form.find((f) => f.name === name)?.data?.toString()
  const getFile = (name: string) => form.find((f) => f.name === name)

  const title = getField('title')
  const slug = getField('slug')
  const description = getField('description')
  const book = getField('book') || null
  const theme = getField('theme') || null
  const rawTags = getField('tags') || ''
  const zipFile = getFile('file')
  const posterFile = getFile('poster')

  if (!title || !slug || !description || !zipFile?.data) {
    throw createError({ statusCode: 400, message: 'Missing required fields or ZIP file' })
  }

  // 🗂️ Extract ZIP & Upload Files to S3
  const zip = new AdmZip(Buffer.from(zipFile.data))
  const entries = zip.getEntries()

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue
  
    const key = `games/${slug}/${entry.entryName}`
    const contentType = mime.lookup(entry.entryName) || 'application/octet-stream'
  
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: entry.getData(),
      ContentType: contentType,
    }))
  }

  // 🖼️ Upload Poster to S3
  let posterUrl: string | null = null
  if (posterFile?.data && posterFile.filename) {
    const ext = posterFile.filename.split('.').pop()
    const posterKey = `posters/${Date.now()}-${nanoid()}.${ext}`

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: posterKey,
        Body: posterFile.data,
        ContentType: posterFile.type,
      })
    )

    posterUrl = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${posterKey}`
  }

  // 🏷️ Tags
  const tagNames = rawTags.split(',').map(t => t.trim()).filter(Boolean)
  const tags = await Promise.all(tagNames.map(name =>
    prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  ))

  // 💾 Save Game Record
  const game = await prisma.game.create({
    data: {
      userId: user.id,
      title,
      slug,
      description,
      book,
      theme,
      path: `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/games/${slug}/index.html`,
      poster: posterUrl,
      tags: {
        connect: tags.map(tag => ({ id: tag.id })),
      },
    },
  })

  return { success: true, game }
})
