// server/api/chat/get.ts
import { defineEventHandler, getQuery, createError } from 'h3';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const db = new DynamoDBClient({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default defineEventHandler(async (event) => {
  const { roomId } = getQuery(event);

  if (!roomId) {
    throw createError({ statusCode: 400, message: 'Missing roomId' });
  }

  try {
    const res = await db.send(
      new QueryCommand({
        TableName: 'LiveChatMessages',
        KeyConditionExpression: 'roomId = :roomId',
        ExpressionAttributeValues: {
          ':roomId': { S: roomId },
        },
        ScanIndexForward: true, // oldest to newest
        Limit: 50, // latest 50 messages
      })
    );

    const messages = res.Items?.map((item) => ({
      roomId: item.roomId.S,
      timestamp: Number(item.timestamp.N),
      userId: Number(item.userId.S),
      username: item.username.S,
      avatar: item.avatar.S,
      message: item.message.S,
    })) || [];

    return { success: true, messages };
  } catch (err) {
    console.error('❌ DynamoDB Query error:', err);
    throw createError({ statusCode: 500, message: 'Failed to fetch messages' });
  }
});
