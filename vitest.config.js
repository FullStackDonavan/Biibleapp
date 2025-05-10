import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "server/__tests__/**/*.spec.ts"], // Add this to find tests
    deps: {
      inline: [/@nuxt\/test-utils-edge/],
    },
  },
})
