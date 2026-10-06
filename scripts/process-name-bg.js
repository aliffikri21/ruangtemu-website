const sharp = require('sharp');
const path = require('path');

async function processNameBg() {
  const inputPath = 'C:/Users/ADVAN/.gemini/antigravity-ide/brain/4148b89e-737c-4b40-ba89-615de13edcc1/.user_uploaded/media_1791297931264.png';
  const outputPath = path.join(process.cwd(), 'public/images/events/ilva-ricky-name-bg.png');

  const meta = await sharp(inputPath).metadata();
  console.log('Size:', meta.width, 'x', meta.height);

  // Transition smoothly from Y=400 and reach 100% opaque by Y=445
  const overlaySvg = Buffer.from(`
    <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bottomClean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020302" stop-opacity="0"/>
          <stop offset="10%" stop-color="#020302" stop-opacity="1"/>
          <stop offset="100%" stop-color="#020302" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect x="0" y="400" width="${meta.width}" height="${meta.height - 400}" fill="url(#bottomClean)"/>
    </svg>
  `);

  await sharp(inputPath)
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .png()
    .toFile(outputPath);

  console.log('Clean name input BG created at:', outputPath);
}

processNameBg().catch(console.error);
