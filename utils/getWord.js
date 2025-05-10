// server/api/word/[word].ts
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError } from 'h3';

const prisma = new PrismaClient();

/**
 * Helper function to clean up Hebrew text.
 * Adjust the regex as needed. In this example, we remove the punctuation marks ׃ and ׀.
 */
function cleanHebrewText(text: string): string {
  return text.normalize("NFC").replace(/[׃־]/g, '').trim();
}

export default defineEventHandler(async (event) => {
  // Retrieve the dynamic route parameter.
  let { word } = event.context.params;
  if (!word) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing word parameter.'
    });
  }

  // Decode the URL-encoded word and normalize it.
  word = decodeURIComponent(word).normalize("NFC");

  // Clean the word by removing unwanted punctuation.
  const cleanedWord = cleanHebrewText(word);

  // Log the values for debugging.
  console.log("Original word:", word);
  console.log("Cleaned word:", cleanedWord);

  try {
    // Query the database using the cleaned word.
    const translation = await prisma.wordTranslation.findFirst({
      where: {
        text: { equals: cleanedWord }
      }
    });

    // If no record is found, return an object with the Hebrew word and empty values.
    if (!translation) {
      return {
        hebrew: cleanedWord,
        translation: "",
        transliteration: "",
        pos: "",
        gender: "",
        message: "Word not found in database."
      };
    }

    // Return the full record if found.
    return {
      hebrew: translation.text,
      translation: translation.english || "",
      transliteration: translation.transliteration || "",
      pos: translation.pos || "",
      gender: translation.gender || ""
    };
  } catch (error: any) {
    console.error("Error in /api/word/[word].ts:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'An error occurred.'
    });
  }
});
