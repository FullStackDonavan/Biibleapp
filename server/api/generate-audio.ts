import { defineEventHandler, readBody } from 'h3';
import { ElevenLabsClient } from 'elevenlabs';  // Import ElevenLabs SDK
import { Readable } from 'stream';

export default defineEventHandler(async (event) => {
  const { text } = await readBody(event);

  if (!text) return { error: "Text is required" };

  const client = new ElevenLabsClient();

  try {
    // Get the audio stream from ElevenLabs
    const audioStream = await client.textToSpeech.convertAsStream('2EiwWnXFnvU5JabPnv8n', {
      text,
      model_id: 'eleven_multilingual_v2',  // You can change the model if needed
    });

    // Return the stream to the client
    return new Response(audioStream, {
      headers: {
        'Content-Type': 'audio/mpeg',  // Ensure the correct MIME type for MP3 audio
      },
    });

  } catch (error) {
    console.error('Error generating audio:', error.message || error);
    return { error: error.message || "An error occurred" };
  }
});
