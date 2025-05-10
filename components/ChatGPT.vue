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
        },],
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

      try {
        const systemPrompt = `
You are a Christian theological assistant who only answers using the Bible.
All your answers must:
- Be based strictly on the Bible (Old and New Testament)
- Include direct Scripture references when possible (e.g., John 3:16)
- Avoid personal opinions, speculation, or non-biblical sources
- Keep your tone pastoral, respectful, and focused on Scripture
`;

        const messagesForAI = [
          { role: "system", content: systemPrompt },
          ...this.messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        ];

        const response = await fetch("/api/chatgpt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messagesForAI,
          }),
        });

        const data = await response.json();
        const assistantReply = data?.choices?.[0]?.message?.content?.trim();

        if (assistantReply) {
          this.messages.push({
            id: this.messages.length + 1,
            text: assistantReply,
            sender: "system",
          });

          this.scrollToBottom();
          await this.getFollowUpSuggestions(assistantReply);
        } else {
          this.messages.push({
            id: this.messages.length + 1,
            text: "Sorry, I couldn't generate a response.",
            sender: "system",
          });
        }
      } catch (err) {
        console.error("ChatGPT API Error:", err);
        this.messages.push({
          id: this.messages.length + 1,
          text: "Sorry, something went wrong with the API.",
          sender: "system",
        });
      }

      this.scrollToBottom();
    },

    async getFollowUpSuggestions(lastAnswer) {
      try {
        const prompt = `Based on the following biblical answer, suggest 3 thoughtful follow-up questions the user might ask:\n\n"${lastAnswer}"\n\nJust list them as plain questions.`;

        const response = await fetch("/api/chatgpt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        });

        const data = await response.json();
        const suggestionsText = data?.choices?.[0]?.message?.content || "";

        this.followUps = suggestionsText
          .split("\n")
          .map((line) => line.replace(/^\d+[\).\s]*/, "").trim())
          .filter((line) => line.length > 0);
      } catch (err) {
        console.error("Error fetching follow-up suggestions:", err);
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
