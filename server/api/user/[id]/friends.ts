import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const userId = parseInt(event.context.params.id, 10); // Extract user ID from the route params

  try {
    const friends = await prisma.friendship.findMany({
      where: {
        userId,
      },
      include: {
        friend: true, // Include friend user details
      },
    });

    // Transform the friends data
    return {
      friends: friends.map((friendship) => ({
        id: friendship.friend.id,
        firstName: friendship.friend.firstName,
        lastName: friendship.friend.lastName,
        avatar: friendship.friend.avatar || 'https://placehold.co/100x100',
      })),
    };
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch friends' });
  }
});
