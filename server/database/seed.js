const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { PrismaClient } = require("@prisma/client");
const { transliterate } = require("hebrew-transliteration");
const { translateText, analyzeHebrewText } = require("./translate");
const { separatePrefix } = require("../../utils/helpers");

const prisma = new PrismaClient();

// **File Paths**
const hebrew = path.join(__dirname, "data.tsv");

// Load the JSON file
const polemicsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "christianity_criticism.json"), "utf-8")
);
const BATCH_SIZE = 20000;

// **Standardized Book Names**
const bookNameMap = {
  "Revelation": "Revelation of John",
  "1 Kings": "I Kings",
  "2 Kings": "II Kings",
  "1 Samuel": "I Samuel",
  "2 Samuel": "II Samuel",
  "1 Chronicles": "I Chronicles",
  "2 Chronicles": "II Chronicles",
  "1 Corinthians": "I Corinthians",
  "2 Corinthians": "II Corinthians",
  "1 Timothy": "I Timothy",
  "2 Timothy": "II Timothy",
  "1 Thessalonians": "I Thessalonians",
  "2 Thessalonians": "II Thessalonians",
  "1 Peter": "I Peter",
  "2 Peter": "II Peter",
  "1 John": "I John",
  "2 John": "II John",
  "3 John": "III John",
};

// **Batch Insert Function**
async function batchInsert(table, data) {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    try {
      await prisma[table].createMany({ data: batch, skipDuplicates: true });
      console.log(`✅ Inserted ${batch.length} records into ${table}`);
    } catch (error) {
      console.error(`❌ Error inserting batch in ${table}:`, error);
    }
  }
}

// **Seed Bible Translations**
async function seedTranslation(translationData, translationDetails) {
  console.log(`📖 Seeding ${translationDetails.translation} Translation...`);

  const translation = await prisma.translation.upsert({
    where: { translation: translationDetails.translation },
    update: {},
    create: {
      translation: translationDetails.translation,
      title: translationDetails.title,
      license: translationDetails.license,
    },
  });

  console.log(`✅ Inserted Translation: ${translation.translation}`);

  // ✅ Insert Books
  const books = translationData.books.map((book) => ({
    name: book.name,
    translationId: translation.id,
  }));

  await batchInsert("books", books);

  const chapters = [];
  const verses = [];

  for (const book of translationData.books) {
    const bookRecord = await prisma.books.findFirst({
      where: { name: book.name, translationId: translation.id },
    });

    if (!bookRecord) {
      console.error(`❌ Book not found: ${book.name}`);
      continue;
    }

    for (const chapter of book.chapters) {
      const chapterRecord = await prisma.chapters.create({
        data: {
          number: chapter.chapter,
          bookId: bookRecord.id,
          translationId: translation.id,
        },
      });

      console.log(`📖 Inserted Chapter ${chapter.chapter} for ${book.name}`);

      for (const verse of chapter.verses) {
        verses.push({
          number: verse.verse,
          text: verse.text,
          chapterId: chapterRecord.id,
          translationId: translation.id,
        });
      }
    }
  }

  await batchInsert("chapters", chapters);
  await batchInsert("verses", verses);
  await seedCrossReferences(translation.id);
}

// **Seed Cross References**
async function seedCrossReferences(translationId) {
  console.log(`🔗 Seeding Cross References for translation ID: ${translationId}`);

  const crossRefFiles = [
    "cross_references_0.json",
    "cross_references_1.json",
    "cross_references_2.json",
    "cross_references_3.json",
    "cross_references_4.json",
    "cross_references_5.json",
    "cross_references_6.json",
  ];

  let crossRefsBatch = [];
  let totalInserted = 0;
  let batchCount = 0;

  for (const file of crossRefFiles) {
    const filePath = `server/database/bible_db/sources/extras/${file}`;
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      continue;
    }

    const crossRefsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const ref of crossRefsData.cross_references) {
      const { from_verse, to_verse, votes = 0 } = ref;
      if (!from_verse?.book || !from_verse.chapter || !from_verse.verse) continue;

      const fromBookName = bookNameMap[from_verse.book] || from_verse.book;
      const fromVerse = await prisma.verses.findFirst({
        where: {
          chapter: {
            number: from_verse.chapter,
            book: { name: fromBookName },
          },
          number: from_verse.verse,
          translationId: translationId,
        },
        select: { id: true, translationId: true },
      });

      if (!fromVerse) continue;

      for (const toVerseData of to_verse || []) {
        const toBookName = bookNameMap[toVerseData.book] || toVerseData.book;

        const toVerse = await prisma.verses.findFirst({
          where: {
            chapter: {
              number: toVerseData.chapter,
              book: { name: toBookName },
            },
            number: toVerseData.verse_start,
            translationId: translationId,
          },
          select: { id: true },
        });

        if (!toVerse) continue;

        crossRefsBatch.push({
          fromVerseId: fromVerse.id,
          toVerseId: toVerse.id,
          votes: votes,
        });

        if (crossRefsBatch.length >= BATCH_SIZE) {
          batchCount++;
          console.log(`🚀 Inserting batch #${batchCount} (${crossRefsBatch.length} records)...`);
          await insertCrossRefsBatch(crossRefsBatch);
          totalInserted += crossRefsBatch.length;
          crossRefsBatch = [];
        }
      }
    }
  }

  if (crossRefsBatch.length > 0) {
    batchCount++;
    console.log(`🚀 Inserting final batch #${batchCount} (${crossRefsBatch.length} records)...`);
    await insertCrossRefsBatch(crossRefsBatch);
    totalInserted += crossRefsBatch.length;
  }

  console.log(`🎉 Inserted ${totalInserted} cross-references for translation ID ${translationId}!`);
}


// **Batch Insert Helper Function**
async function insertCrossRefsBatch(crossRefsBatch) {
  try {
    const batchArray = crossRefsBatch.map((entry) => ({
      fromVerseId: entry.fromVerseId,
      toVerseId: entry.toVerseId,
      votes: entry.votes || 0,
    }));

    await prisma.crossReference.createMany({ data: batchArray, skipDuplicates: true });
    console.log(`✅ Inserted ${batchArray.length} cross-references`);
  } catch (error) {
    console.error(`❌ Error inserting cross-references batch:`, error);
  }
}

async function seedDevotionals() {
  const devotionalsPath = path.join(__dirname, "devotionals/devotionals.json")

  if (!fs.existsSync(devotionalsPath)) {
    console.error("❌ devotionals.json file not found.")
    return
  }

  const rawDevotionals = JSON.parse(fs.readFileSync(devotionalsPath, "utf-8"))

  // 🔁 Convert date strings into Date objects
  const devotionals = rawDevotionals.map((d) => ({
    ...d,
    date: new Date(d.date), // 👈 Fix is here
  }))

  try {
    await prisma.devotional.createMany({
      data: devotionals,
      skipDuplicates: true,
    })
    console.log(`✅ Inserted ${devotionals.length} devotionals`)
  } catch (err) {
    console.error("❌ Error inserting devotionals:", err)
  } finally {
    await prisma.$disconnect()
  }
}


// **Seed Apologetics**
async function seedApologetics() {
  console.log("📖 Seeding Polemics Data...");
  const polemicsEntries = [];

  for (const [category, claims] of Object.entries(polemicsData.polemics)) {
    for (const claim of Object.values(claims)) {
      polemicsEntries.push({ category, claim });
    }
  }

  await batchInsert("polemics", polemicsEntries);
}

// **Parse the TSV File into an Array of Objects**
async function parseTsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      output: process.stdout,
      terminal: false,
    });

    let isFirstLine = true;
    rl.on("line", (line) => {
      if (isFirstLine) {
        isFirstLine = false;
        return;
      }

      const columns = line.split("\t");
      if (columns.length >= 6) {
        data.push({
          xmlId: columns[0].trim(),
          ref: columns[1].trim(),
          class: columns[2].trim() || null,
          text: columns[3].trim(),
          transliteration: columns[4].trim() || null,
          after: columns[5].trim() || null,
          strongNumberX: columns[6]?.trim() || null,
          english: columns[12]?.trim() || null,
        });
      }
    });

    rl.on("close", () => resolve(data));
    rl.on("error", (error) => reject(error));
  });
}

// **Insert Parsed TSV Data into the WordTranslation Table**
async function insertWordTranslations(wordsArray) {
  const formattedWords = wordsArray.map((wordObj) => ({
    xmlId: wordObj.xmlId,
    ref: wordObj.ref,
    class: wordObj.class,
    text: wordObj.text,
    lookupText: separatePrefix(wordObj.text),
    transliteration: wordObj.transliteration,
    after: wordObj.after,
    strongNumberX: wordObj.strongNumberX,
    english: wordObj.english,
  }));

  await batchInsert("wordTranslation", formattedWords);
}

async function seedPolemics() {
  console.log("📖 Seeding Polemics Data...");
  const filePath = path.join(__dirname, "christianity_criticism.json");
  const polemicsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const polemicsEntries = [];

  for (const religion of polemicsData) {
    for (const verse of religion.verses) {
      polemicsEntries.push({
        category: religion.name,
        claim: verse.text,
        reference: verse.translation || null
      });
    }
  }

  await batchInsert("polemics", polemicsEntries);
}

//seed quran https://github.com/risan/quran-json/tree/main/dist
async function seedQuran() {
  const quranPath = path.join(__dirname, "quran/quran_en.json");

  if (!fs.existsSync(quranPath)) {
    console.error("❌ quran_en.json file not found.");
    return;
  }

  const quranData = JSON.parse(fs.readFileSync(quranPath, "utf-8"));

  console.log("📖 Seeding Quran Translation...");

  // 1. Create or upsert translation
  const translation = await prisma.quranTranslation.upsert({
    where: { code: "en.sahih" },
    update: {},
    create: {
      code: "en.sahih",
      name: "Sahih International",
      license: "Public Domain",
    },
  });

  const surahRecords = [];
  const ayahRecords = [];

  for (const surah of quranData) {
    surahRecords.push({
      number: surah.id,
      name: surah.name,
      transliteration: surah.transliteration,
      translatedTitle: surah.translation,
      revelationType: surah.type,
      totalVerses: surah.total_verses,
      translationId: translation.id,
    });
  }

  // 2. Insert all surahs
  await batchInsert("quranSurah", surahRecords);

  // 3. Fetch surah IDs for reference
  const existingSurahs = await prisma.quranSurah.findMany({
    where: { translationId: translation.id },
    select: { id: true, number: true },
  });

  const surahIdMap = new Map(existingSurahs.map((s) => [s.number, s.id]));

  // 4. Build ayah records
  for (const surah of quranData) {
    const surahId = surahIdMap.get(Number(surah.id));
    if (!surahId) {
      console.warn(`⚠️ Surah ID not found for Surah ${surah.id}`);
      continue;
    }
  
    for (const verse of surah.verses) {
      ayahRecords.push({
        surahNumber: surah.id,
        ayahNumber: verse.id,
        text: verse.text,               // Arabic
        translation: verse.translation, // English
        surahId: surahId,
        translationId: translation.id,
      });
      
    }
  }
  
  
  

  // 5. Insert all ayahs
  await batchInsert("quranAyah", ayahRecords);

  console.log(`✅ Inserted ${surahRecords.length} surahs and ${ayahRecords.length} ayahs`);
}

// **Main Function**
async function main() {
  console.log("🚀 Starting database seeding...");
  try {
    const wordsArray = await parseTsvFile(hebrew);
    console.log("✅ TSV File parsed successfully");

    await insertWordTranslations(wordsArray);
    console.log("📝 Word translations inserted into the database.");

    const wlcData = JSON.parse(fs.readFileSync("server/database/seeds/core/WLC.json", "utf-8"));
    const wlcDetails = { translation: "WLC", title: "Westminster Leningrad Codex", license: "Public Domain" };
    const kjvData = JSON.parse(fs.readFileSync("server/database/seeds/core/KJV.json", "utf-8"));
    const kjvDetails = { translation: "KJV", title: "King James Version", license: "Public Domain" };

    await seedApologetics();
    await seedTranslation(kjvData, kjvDetails);
    await seedTranslation(wlcData, wlcDetails);
 
    await seedDevotionals();
    await seedQuran();

    console.log("✅ Seeding completed!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("❌ Unexpected error:", e);
  process.exit(1);
});
