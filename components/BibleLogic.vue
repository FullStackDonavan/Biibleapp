<template>
  <div class="w-full p-4 mx-auto my-8">
    <!-- Starter Questions -->
    <div v-if="!hasStarted" class="mb-6">
      <p class="mb-2 font-semibold text-gray-800 dark:text-white">
        Get started with a question:
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(question, index) in starterQuestions"
          :key="index"
          @click="useStarter(question)"
          class="px-3 py-2 bg-white text-gray-800 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          {{ question }}
        </button>
      </div>
    </div>

    <!-- Chat Messages -->
    <div
      ref="chatContainer"
      class="bg-gray-300 dark:bg-gray-600 p-8 my-8 rounded-lg max-h-[70vh] overflow-y-auto transition-all duration-300 ease-in-out"
    >
      <div v-for="message in messages" :key="message.id" class="mb-4">
        <div v-if="message.sender === 'user'" class="text-right">
          <span
            class="inline-block bg-blue-500 text-white p-3 rounded-lg max-w-[80%] whitespace-pre-wrap text-left"
          >
            {{ message.text }}
          </span>
        </div>
        <div v-else>
          <span
            class="inline-block bg-gray-800 text-white p-3 rounded-lg max-w-[80%] whitespace-pre-wrap text-left"
          >
            {{ message.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- Follow-up Questions -->
    <div v-if="followUps.length" class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="(question, index) in followUps"
        :key="index"
        @click="useFollowUp(question)"
        class="px-3 py-2 bg-white text-gray-800 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        {{ question }}
      </button>
    </div>

    <!-- Input Field -->
    <div class="flex">
      <input
        v-model="newMessage"
        @keydown.enter.prevent="sendMessage()"
        type="text"
        class="flex-1 p-2 bg-gray-300 dark:bg-gray-600 rounded-l"
        placeholder="Type your message..."
      />
      <button
        @click="sendMessage()"
        class="ml-2 p-2 bg-blue-500 text-white rounded-r"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [{
        id: 1,
        text: "Hi there! How can I help you with Scripture today?",
        sender: "system",
      }],
      newMessage: "",
      followUps: [],
      hasStarted: false,
      starterQuestions: [
        "What does the Bible say about salvation?",
        "Who is Jesus according to Scripture?",
        "What is the role of the Holy Spirit?",
        "How can I grow in faith biblically?",
      ],
    };
  },
  mounted() {
    this.scrollToBottom();
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    useStarter(question) {
      this.hasStarted = true;
      this.sendMessage(question);
    },

    useFollowUp(question) {
      this.sendMessage(question);
    },

    async sendMessage(customText = null) {
      const messageText = customText || this.newMessage.trim();
      if (!messageText) return;

      this.hasStarted = true;

      const userEntry = {
        id: this.messages.length + 1,
        text: messageText,
        sender: "user",
      };

      this.messages.push(userEntry);
      this.newMessage = "";
      this.followUps = [];
      this.scrollToBottom();
      let messagesForAI = [
  { role: "user", content: "What is the role of the Holy Spirit in Christianity?" },
  { role: "assistant", content: "The Holy Spirit is a person, not an idea. He is active in the life of believers and helps them make decisions based on God's will." }
];

      try {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tinyllama',
      prompt: messagesForAI.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join('\n') + "\nAssistant:",
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let rawResponse = '';

  // Read chunks until done
  while (!done) {
    const { value, done: isDone } = await reader.read();
    done = isDone;
    rawResponse += decoder.decode(value, { stream: true });
  }

  console.log("Raw Ollama API Response:", rawResponse); // Log the entire response

  // Split the response into individual JSON objects
  const responseChunks = rawResponse.split('\n').filter(Boolean); // Filter out any empty strings
  
  let completeResponse = '';
  responseChunks.forEach(chunk => {
    try {
      const data = JSON.parse(chunk); // Parse each JSON object
      completeResponse += data.response || '';
    } catch (err) {
      console.error("Error parsing chunk:", err);
    }
  });

  // Now completeResponse holds the concatenated result
  if (completeResponse) {
    this.messages.push({
      id: this.messages.length + 1,
      text: completeResponse.trim(),
      sender: "system",
    });
    this.scrollToBottom();
    await this.getFollowUpSuggestions(completeResponse);
  } else {
    this.messages.push({
      id: this.messages.length + 1,
      text: "Sorry, I couldn't generate a response.",
      sender: "system",
    });
  }
} catch (err) {
  console.error("Ollama API Error:", err);
  this.messages.push({
    id: this.messages.length + 1,
    text: `Sorry, something went wrong with the Ollama API: ${err.message}`,
    sender: "system",
  });
}


      this.scrollToBottom();
    },

    async getFollowUpSuggestions(lastAnswer) {
      try {
        const prompt = `Based on the following biblical answer, suggest 3 thoughtful follow-up questions the user might ask:\n\n"${lastAnswer}"\n\nJust list them as plain questions.`;

        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tinyllama',
            prompt
          })
        });


        const data = await response.json();
        console.log("Ollama raw response:", data);
        const suggestionsText = data?.response || "";

        this.followUps = suggestionsText
          .split("\n")
          .map((line) => line.replace(/^\d+[\).\s]*/, "").trim())
          .filter((line) => line.length > 0);
      } catch (err) {
        console.error("Error fetching follow-up suggestions from Ollama:", err);
      }
    },
  },
};
</script>

<style scoped>
/* Optional scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: #999;
  border-radius: 4px;
}
</style>
