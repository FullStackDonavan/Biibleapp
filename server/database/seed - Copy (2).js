const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
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

// **Seed Polemics**
async function seedPolemics() {
  console.log("📖 Seeding Polemics Data...");
  const polemicsEntries = [];

  for (const [category, claims] of Object.entries(polemicsData.polemics)) {
    for (const claim of Object.values(claims)) {
      polemicsEntries.push({ category, claim });
    }
  }

  await batchInsert("polemics", polemicsEntries);
}

// **Main Function**
async function main() {
  console.log("🚀 Starting database seeding...");
  try {
    //const wordsArray = await parseTsvFile(filePath);
    //console.log("✅ TSV File parsed successfully");

    //await insertWordTranslations(wordsArray);
    //console.log("📝 Word translations inserted into the database.");

    const wlcData = JSON.parse(fs.readFileSync("server/database/seeds/core/WLC.json", "utf-8"));
    const wlcDetails = { translation: "WLC", title: "Westminster Leningrad Codex", license: "Public Domain" };
    const kjvData = JSON.parse(fs.readFileSync("server/database/seeds/core/KJV.json", "utf-8"));
    const kjvDetails = { translation: "KJV", title: "King James Version", license: "Public Domain" };

    await seedPolemics();
    await seedTranslation(kjvData, kjvDetails);
    await seedTranslation(wlcData, wlcDetails);
 

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
