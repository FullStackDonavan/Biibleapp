export function removeNikud(text) {
    if (!text) return "";
  
    if (!text) return "";
    return text
      .normalize("NFD") // Remove Nikud
      .replace(/[\u0591-\u05C7]/g, "") // Strip diacritics
      .replace(/^[בלמהו]/, "$1") // Remove common prefixes: ב (in), מ (from), ל (to)
      .normalize("NFC")
      .trim();

      
}


// utils/helpers.js
export function separatePrefix(text) {
  if (!text) return "";

  // Normalize and remove Hebrew diacritics (Nikud and Cantillation)
  let cleanText = text
    .normalize("NFD")
    .replace(/[\u0591-\u05C7]/g, "") // Remove all Hebrew diacritics
    .normalize("NFC")
    .trim();

  if (cleanText.length > 1) {
    const prefixChars = ['ו', 'ב', 'ל', 'מ', 'כ', 'ש'];
    let lastChar = cleanText.charAt(cleanText.length - 1);

    if (prefixChars.includes(lastChar)) {
      // Separate the last character (prefix) and return
      return cleanText.slice(0, -1).trim() + " " + lastChar;
    }
  }

  return cleanText; // Return as-is if no prefix is found
}





export function removeDefiniteArticle(text) {
  if (!text) return "";
  // Normalize and remove Hebrew diacritics
  let cleanText = text
    .normalize("NFD")
    .replace(/[\u0591-\u05C7]/g, "") // remove Nikud and cantillation marks
    .normalize("NFC")
    .trim();
  
  // If the first character is the definite article "ה", remove it.
  if (cleanText.startsWith("ה") && cleanText.length > 1) {
    return cleanText.slice(1).trim();
  }
  return cleanText;
}






  

  