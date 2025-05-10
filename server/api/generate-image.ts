import { defineEventHandler, readBody } from 'h3';
import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event);
  if (!prompt) return { error: "Prompt is required" };

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

  try {
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return { imageUrl: response.data[0]?.url || '' };
  } catch (error) {
    return { error: error.message || "An error occurred" };
  }
});
