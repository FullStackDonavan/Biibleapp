// File: server/api/auth/getCookie.ts
import { defineEventHandler, getCookie, createError } from 'h3';

export default defineEventHandler((event) => {
  // Retrieve the auth_token cookie from the request
  const authToken = getCookie(event, 'auth_token');

  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No auth token found',
    });
  }

  return {
    success: true,
    authToken,
  };
});
