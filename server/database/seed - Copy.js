const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  // Load JSON data https://github.com/scrollmapper/bible_databases/tree/2025/formats/json
  // Core
  const asvData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/core/ASV.json'), 'utf-8'));
  const bbeData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/core/BBE.json'), 'utf-8'));
  const lebData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/core/LEB.json'), 'utf-8'));
  const wlcData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/core/WLC.json'), 'utf-8'));  
  const yltData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/core/YLT.json'), 'utf-8'));  
  const kjvData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/core/KJV.json'), 'utf-8')); 

  // Historical
  const g1959Data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/historical/Geneva1599.json'), 'utf-8'));
  const tyndaleData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/historical/Tyndale.json'), 'utf-8'));
  const darbyData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/historical/Darby.json'), 'utf-8'));

  // Catholic
  const cpdvData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/catholic/CPDV.json'), 'utf-8'));
  const drcData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/catholic/DRC.json'), 'utf-8'));

  // Modernized
  const bsbData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/modernized/BSB.json'), 'utf-8'));
  const mkjvData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/modernized/MKJV.json'), 'utf-8'));
  const nhebData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seeds/modernized/NHEB.json'), 'utf-8'));

  // Greek https://ebible.org/find/country.php?c=GR


  // Upsert KJV Translation
  console.log('Inserting/Upserting KJV Translation...');
  const kjvTranslation = await prisma.translation.upsert({
    where: { translation: 'KJV' },
    update: {},
    create: {
      translation: 'KJV',
      title: 'KJV: King James Version (1769) with Strongs Numbers and Morphology and CatchWords',
      license: 'Public Domain',
    },
  });
  console.log(`Inserted/Found translation: ${kjvTranslation.translation}`);


  // Upsert ASV Translation
  console.log('Inserting/Upserting ASV Translation...');
  const asvTranslation = await prisma.translation.upsert({
    where: { translation: 'ASV' },
    update: {},
    create: {
      translation: 'ASV',
      title: 'ASV: American Standard Version (1901)',
      license: 'Public Domain',
    },
  });
  console.log(`Inserted/Found translation: ${asvTranslation.translation}`);

  // Upsert BBE Tanslation
  console.log('Inserting/Upserting ASV Translation...');
  const bbeTranslation = await prisma.translation.upsert({
    where: { translation: 'BBE' },
    update: {},
    create: {
      translation: 'BBE',
      title: 'BBE: 1949/1964 Bible in Basic English',
      license: 'Public Domain',
    },
  });
  console.log(`Inserted/Found translation: ${bbeTranslation.translation}`);

  // Upsert G1959 Tanslation
  console.log('Inserting/Upserting G1959Translation...');
  const g1959Translation = await prisma.translation.upsert({
    where: { translation: 'G1959' },
    update: {},
    create: {
      translation: 'G1959',
      title: 'Geneva1599: Geneva Bible (1599)',
      license: 'Public Domain',
    },
  });
  console.log(`Inserted/Found translation: ${g1959Translation.translation}`);

   // Upsert LEB Tanslation
   console.log('Inserting/Upserting LEBTranslation...');
   const lebTranslation = await prisma.translation.upsert({
     where: { translation: 'LEB' },
     update: {},
     create: {
       translation: 'LEB',
       title: 'LEB: The Lexham English Bible',
       license: 'Public Domain',
     },
   });
   console.log(`Inserted/Found translation: ${lebTranslation.translation}`); 

   // Upsert WLC Tanslation
   console.log('Inserting/Upserting WLCTranslation...');
   const wlcTranslation = await prisma.translation.upsert({
     where: { translation: 'WLC' },
     update: {},
     create: {
       translation: 'WLC',
       title: 'WLC: Westminster Leningrad Codex',
       license: 'Public Domain',
     },
   });
   console.log(`Inserted/Found translation: ${wlcTranslation.translation}`); 

    // Upsert YLT Tanslation
    console.log('Inserting/Upserting YLTTranslation...');
    const yltTranslation = await prisma.translation.upsert({
      where: { translation: 'YLT' },
      update: {},
      create: {
        translation: 'YLT',
        title: "YLT: Young's Literal Translation (1898)",
        license: 'Public Domain',
       },
    });
    console.log(`Inserted/Found translation: ${yltTranslation.translation}`);

    // Upsert Tyndale Tanslation
    console.log('Inserting/Upserting TyndaleTranslation...');
    const tyndaleTranslation = await prisma.translation.upsert({
      where: { translation: 'Tyndale' },
      update: {},
      create: {
        translation: 'Tyndale',
        title: "Tyndale: William Tyndale Bible (1525/1530)",
        license: 'Public Domain',
       },
    });
    console.log(`Inserted/Found translation: ${tyndaleTranslation.translation}`);  

    // Upsert Darby Tanslation
    console.log('Inserting/Upserting DarbyTranslation...');
    const darbyTranslation = await prisma.translation.upsert({
      where: { translation: 'Darby' },
      update: {},
      create: {
        translation: 'Darby',
        title: "Darby: Darby Bible (1889)",
        license: 'Public Domain',
       },
    });
    console.log(`Inserted/Found translation: ${darbyTranslation.translation}`);

    // Upsert CPDV Tanslation
    console.log('Inserting/Upserting CPDVTranslation...');
    const cpdvTranslation = await prisma.translation.upsert({
      where: { translation: 'CPDV' },
      update: {},
      create: {
        translation: 'CPDV',
        title: "CPDV: Catholic Public Domain Version",
        license: 'Public Domain',
       },
    });
    console.log(`Inserted/Found translation: ${cpdvTranslation.translation}`);   
    
    // Upsert DRC Tanslation
    console.log('Inserting/Upserting DRCTranslation...');
    const drcTranslation = await prisma.translation.upsert({
      where: { translation: 'DRC' },
      update: {},
      create: {
        translation: 'DRC',
        title: "DRC: Douay-Rheims Bible, Challoner Revision",
        license: 'Public Domain',
      },
    });
    console.log(`Inserted/Found translation: ${drcTranslation.translation}`);   
    
    // Upsert BSB Tanslation
    console.log('Inserting/Upserting BSBTranslation...');
    const bsbTranslation = await prisma.translation.upsert({
      where: { translation: 'BSB' },
      update: {},
      create: {
        translation: 'BSB',
        title: "BSB: Berean Standard Bible",
        license: 'Public Domain',
      },
    });
    console.log(`Inserted/Found translation: ${bsbTranslation.translation}`);    
    
    // Upsert MKJV Tanslation
    console.log('Inserting/Upserting MKJTVranslation...');
    const mkjvTranslation = await prisma.translation.upsert({
      where: { translation: 'MKJV' },
      update: {},
      create: {
        translation: 'MKJV',
        title: "MKJV: Green's Modern King James Version",
        license: 'Public Domain',
      },
    });
    console.log(`Inserted/Found translation: ${mkjvTranslation.translation}`);     
    
    // Upsert NHEB Tanslation
    console.log('Inserting/Upserting NHEBTranslation...');
    const nhebTranslation = await prisma.translation.upsert({
      where: { translation: 'NHEB' },
      update: {},
      create: {
        translation: 'NHEB',
        title: "NHEB: New Heart English Bible",
        license: 'Public Domain',
      },
    });
    console.log(`Inserted/Found translation: ${nhebTranslation.translation}`);    
       

  // Function to process books and verses for a translation
  async function processTranslation(data, translation) {
    console.log(`Processing translation: ${translation.translation}`);
    for (const book of data.books) {
      console.log(`Processing book: ${book.name}`);
      const insertedBook = await prisma.books.upsert({
        where: { name_translationId: { name: book.name, translationId: translation.id } },
        update: {},
        create: {
          name: book.name,
          translationId: translation.id,
        },
      });
      console.log(`Inserted/Found book: ${insertedBook.name} for translation: ${translation.translation}`);

      for (const chapter of book.chapters) {
        console.log(`Processing chapter: ${chapter.chapter} of book: ${book.name}`);
        for (const verse of chapter.verses) {
          await prisma.verses.create({
            data: {
              books: { connect: { id: insertedBook.id } },
              translation: { connect: { id: translation.id } },
              chapter: chapter.chapter,
              verse: verse.verse,
              text: verse.text,
            },
          });
          console.log(
            `Inserted verse: ${chapter.chapter}:${verse.verse} - "${verse.text}" for translation: ${translation.translation}`
          );
        }
      }
    }
  }

  // Process data
  await processTranslation(kjvData, kjvTranslation);
  await processTranslation(asvData, asvTranslation);
  await processTranslation(bbeData, bbeTranslation);
  await processTranslation(g1959Data, g1959Translation);
  await processTranslation(lebData, lebTranslation);
  await processTranslation(wlcData, wlcTranslation);
  await processTranslation(yltData, yltTranslation);
  await processTranslation(tyndaleData, tyndaleTranslation);
  await processTranslation(darbyData, darbyTranslation);
  await processTranslation(cpdvData, cpdvTranslation);
  await processTranslation(drcData, drcTranslation);
  await processTranslation(bsbData, bsbTranslation);
  await processTranslation(mkjvData, mkjvTranslation);
  await processTranslation(nhebData, nhebTranslation);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
