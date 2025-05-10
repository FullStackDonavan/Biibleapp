// GET /api/groups/:id/posts
import { defineEventHandler } from 'h3'
import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  const groupId = Number(event.context.params.id)

  const posts = await prisma.groupPost.findMany({
    where: { groupId },
    orderBy: { createdAt: 'desc' },
  })

  return posts
})
