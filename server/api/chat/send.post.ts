// server/api/chat/send.post.ts
import { defineEventHandler, getHeader, readBody, createError } from 'h3';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import prisma from '~/server/database/client';

const db = new DynamoDBClient({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default defineEventHandler(async (event) => {
  const authToken = getHeader(event, 'authorization')?.replace('Bearer ', '');
  if (!authToken) throw createError({ statusCode: 401, message: 'Missing token' });

  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: true },
  });
  if (!session?.user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const body = await readBody(event);
  const { roomId, message } = body;
  if (!roomId || !message) throw createError({ statusCode: 400, message: 'Missing roomId or message' });

  const timestamp = Date.now();

  try {
    await db.send(
      new PutItemCommand({
        TableName: 'LiveChatMessages',
        Item: {
          roomId: { S: roomId },
          timestamp: { N: String(timestamp) },
          userId: { S: String(session.user.id) },
          username: { S: session.user.username || 'Anonymous' },
          avatar: { S: session.user.avatar || '' },
          message: { S: message },
        },
      })
    );
  } catch (err) {
    console.error('❌ DynamoDB PutItem error:', err);
    throw createError({ statusCode: 500, message: 'Failed to write chat message' });
  }
  

  return {
    success: true,
    message: {
      roomId,
      timestamp,
      userId: session.user.id,
      username: session.user.username,
      avatar: session.user.avatar,
      message,
    },
  };
});
