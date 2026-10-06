const sharp = require('sharp');
const path = require('path');

async function processBg() {
  const inputPath = path.join(process.cwd(), 'public/images/events/ilva-ricky.png');
  const outputPath = path.join(process.cwd(), 'public/images/events/ilva-ricky-clean-bg.png');
  
  const meta = await sharp(inputPath).metadata();
  console.log('Size:', meta.width, 'x', meta.height);
  
  // Create an SVG gradient overlay to smoothly clean ONLY the bottom button & footer area
  // Starting smoothly at Y=630 and fully opaque by Y=658 to completely hide the mockup buttons
  const overlaySvg = Buffer.from(`
    <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bottomClean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020404" stop-opacity="0"/>
          <stop offset="10%" stop-color="#020404" stop-opacity="0.7"/>
          <stop offset="18%" stop-color="#020404" stop-opacity="1"/>
          <stop offset="100%" stop-color="#020404" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect x="0" y="630" width="${meta.width}" height="${meta.height - 630}" fill="url(#bottomClean)"/>
    </svg>
  `);
  
  await sharp(inputPath)
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .png()
    .toFile(outputPath);
    
  console.log('Clean BG created successfully with untouched top at:', outputPath);
}

processBg().catch(console.error);
