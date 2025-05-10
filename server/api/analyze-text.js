require('dotenv').config(); // Load environment variables

const { translateText } = require('../database/translate');

async function processText(text) {
  try {
    const translation = await translateText(text, 'en');
    console.log(`Translation: ${translation}`);
    return translation;
  } catch (error) {
    console.error('❌ Error processing text:', error);
  }
}

module.exports = { processText };
