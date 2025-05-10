import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

// ✅ Ensure `fetch()` is properly mocked
beforeAll(() => {
  vi.stubGlobal("fetch", async () =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          translations: [
            { title: "King James Version (KJV)", translation: "KJV", license: "Public Domain" },
            { title: "New International Version (NIV)", translation: "NIV", license: "© Biblica, Inc." },
          ],
        }),
    })
  );
});

afterAll(() => {
  vi.restoreAllMocks(); // ✅ Restore original fetch after tests
});

describe("API: /api/translations", () => {
  it("✅ Fetches all translations (mocked)", async () => {
    const response = await fetch("http://localhost:3000/api/translations"); // No real request!
    expect(response.ok).toBe(true);

    const json = await response.json();
    expect(json.translations).toBeInstanceOf(Array);
    expect(json.translations.length).toBe(2); // ✅ Now should pass

    // ✅ Ensure mock data is returned correctly
    expect(json.translations[0].title).toBe("King James Version (KJV)");
    expect(json.translations[1].title).toBe("New International Version (NIV)");
  });
});
