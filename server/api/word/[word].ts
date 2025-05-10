// server/api/word/[word].ts
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError } from 'h3';
import { removeDefiniteArticle, separatePrefix } from '../../../utils/helpers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Retrieve the dynamic route parameter
  let { word } = event.context.params;
  if (!word) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing word parameter.'
    });
  }

  // Decode the URL-encoded word and normalize it
  word = decodeURIComponent(word).normalize("NFC");

  // Use the helper to separate the prefix (e.g. "ואת" becomes "ו את")
  const lookupWord = removeDefiniteArticle(separatePrefix(word));

  // Log the word values for debugging
  console.log("Original word:", word);
  console.log("Lookup word:", lookupWord);

  try {
    const translation = await prisma.wordTranslation.findFirst({
      where: {
        // Query using the separated lookup text
        lookupText: { equals: lookupWord }
      }
    });

    if (!translation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Word not found.'
      });
    }
    return translation;
  } catch (error: any) {
    console.error("Error in /api/word/[word].ts:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'An error occurred.'
    });
  }
});
