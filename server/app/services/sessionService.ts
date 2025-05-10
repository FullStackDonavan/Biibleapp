import { sanitizeUserForFrontend } from '~~/server/app/services/userService';
import { H3Event } from "h3"
import { createSession } from "~~/server/database/repositories/sessionRepository"
import { v4 as uuidv4 } from 'uuid'
import { User } from '@prisma/client';
import prisma from "~/server/database/client";



export async function makeSession(user: User, event: H3Event): Promise<User|undefined> {
    const authToken = uuidv4().replaceAll('-', '')
    const session = await createSession({ authToken, userId: user.id })
    const userId = session.userId

    if (userId) {
        // setCookie(event, 'auth_token', authToken, { path: '/', httpOnly: true })
        setCookie(event, 'auth_token', authToken, { path: '/' })
        return getUserBySessionToken(authToken)
    }

    throw Error('Error Creating Session')
}

export async function getUserBySessionToken(authToken: string): Promise<User|undefined> {
    const session = await getSessionByAuthToken(authToken)

    return sanitizeUserForFrontend(session.user)
}


export async function getUserByAuthToken(authToken: string) {
    const session = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    });
  
    if (!session || !session.user) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }
  
    return session.user;
  }








  export async function getSessionByAuthToken(authToken: string): Promise<ISession> {
    const user: User = await getUserByAuthToken(authToken) as unknown as User
  
    return { authToken, user }
  }  