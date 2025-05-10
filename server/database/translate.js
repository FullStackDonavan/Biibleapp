const { Translate } = require("@google-cloud/translate").v2;
const language = require("@google-cloud/language");

const translateClient = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });
const languageClient = new language.LanguageServiceClient(); // Google NLP API

// Function to translate text
async function translateText(text, targetLanguage) {
  try {
    const [translation] = await translateClient.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error("❌ Error during translation:", error);
    throw new Error("Translation failed");
  }
}

// Function to analyze Hebrew text and extract gender, tense, and part of speech
async function analyzeHebrewText(text, targetLanguage = "en") {
  try {
    // Step 1: Translate Hebrew to English
    const translatedText = await translateText(text, targetLanguage);

    // Step 2: Analyze Syntax using Google NLP API
    const document = {
      content: translatedText,
      type: "PLAIN_TEXT",
      language: "en", // Analyze in English
    };

    const [result] = await languageClient.analyzeSyntax({ document });

    // Step 3: Process tokens to extract part of speech, gender, and tense
    const tokens = result.tokens.map((token) => {
      const partOfSpeech = token.partOfSpeech.tag || "UNKNOWN"; // e.g., NOUN, VERB, ADJ
      const gender = token.partOfSpeech.gender || "GU"; // Default to "GU" if unknown
      const tense = token.partOfSpeech.tense || "TU"; // Default to "TU" if unknown

      return {
        word: token.text.content,
        partOfSpeech,
        gender,
        tense,
        translation: "",       // Optionally, fill this in if needed
        transliteration: ""    // Optionally, fill this in if needed
      };
    });

    return tokens; // Returning the structured word translation objects
  } catch (error) {
    console.error("❌ Error analyzing Hebrew text:", error);
    return [];
  }
}

// Export the functions
module.exports = { translateText, analyzeHebrewText };
