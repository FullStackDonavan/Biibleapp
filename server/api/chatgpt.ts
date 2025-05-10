export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const messages = body.messages;
  
    const response = await $fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY_BIBLE_LOGIC}`,
      },
      body: {
        model: "gpt-3.5-turbo",
        messages,
      },
    });
  
    return response;
  });
  