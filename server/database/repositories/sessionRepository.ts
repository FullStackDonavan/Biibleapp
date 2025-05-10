import { IUser } from '~/types/IUser';
import prisma from "~/server/database/client";
import { ISession } from '~~/types/ISession';
import { User } from '@prisma/client';

export async function createSession(sessionData: ISession): Promise<ISession> {
  if (!sessionData.authToken) {
    throw Error('missing auth token for session')
  }
  
  return await prisma.session.create({
    data: {
      userId: sessionData.userId,
      authToken: sessionData.authToken
    },
  })
}

export async function getUserBySessionToken(authToken: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: true },
  });

  if (!session || !session.user) {
    throw new Error('Invalid or expired session token');
  }

  return session.user;
}

export async function getUserByAuthToken(authToken: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { authToken },
    include: { user: true }
  });
  if (!session || !session.user) {
    return null;
  }
  return session.user;
}



export async function getAuthTokenByUserId(userId: number) {
  const session = await prisma.session.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!session) {
    throw new Error("Token not found");
  }

  return session.authToken;
}
