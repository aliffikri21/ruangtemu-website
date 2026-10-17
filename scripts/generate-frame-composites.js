const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createPhotosSVG(width, height, slots, pals) {
  let defsStr = '';
  let photosStr = '';

  slots.forEach((s, idx) => {
    const gid = 'grad_' + idx;
    const cid = 'clip_' + idx;
    const p = pals[idx % pals.length];
    
    defsStr += `
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p[0]}"/>
        <stop offset="100%" stop-color="${p[1]}"/>
      </linearGradient>
      <clipPath id="${cid}">
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx || 8}" ry="${s.rx || 8}"/>
      </clipPath>
    `;

    const cx = s.x + s.w / 2;
    const r = Math.min(s.w, s.h) * 0.13;
    const cy = s.y + s.h * 0.38;
    const bodyY = s.y + s.h * 1.0;
    const bodyRx = r * 2.1;
    const bodyRy = s.h * 0.34;

    const two = s.two || false;
    const xs = two ? [cx - s.w * 0.19, cx + s.w * 0.19] : [cx];

    let avatarsStr = '';
    xs.forEach(px => {
      avatarsStr += `
        <circle cx="${px}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.64)"/>
        <ellipse cx="${px}" cy="${bodyY}" rx="${bodyRx}" ry="${bodyRy}" fill="rgba(255,255,255,0.64)"/>
      `;
    });

    photosStr += `
      <g clip-path="url(#${cid})">
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="url(#${gid})"/>
        ${avatarsStr}
      </g>
    `;
  });

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${defsStr}
      </defs>
      ${photosStr}
    </svg>
  `;
}

async function run() {
  const outDir = path.join(__dirname, '../public/frames');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Helper for rounded corners mask
  const roundMask = (w, h, r) => Buffer.from(`
    <svg width="${w}" height="${h}">
      <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/>
    </svg>
  `);

  // 1. Frame 1 (Happy Wedding Nurul & Iqra, 600 x 900)
  const W1 = 600, H1 = 900;
  const s1 = 600 / 3600;
  const svg1 = createPhotosSVG(
    W1,
    H1,
    [
      { x: Math.round(197 * s1), y: Math.round(1481 * s1), w: Math.round(3205 * s1), h: Math.round(1684 * s1), rx: 6, two: false },
      { x: Math.round(197 * s1), y: Math.round(3285 * s1), w: Math.round(3205 * s1), h: Math.round(1556 * s1), rx: 6, two: true }
    ],
    [
      ["#93c5fd", "#2563eb"],
      ["#7dd3fc", "#0284c7"]
    ]
  );
  const p1Buf = await sharp(Buffer.from(svg1)).resize(W1, H1).png().toBuffer();
  const f1Buf = await sharp('frame1-3d.webp').resize(W1, H1).png().toBuffer();
  const comp1 = await sharp(f1Buf)
    .composite([{ input: p1Buf, blend: 'dest-over', top: 0, left: 0 }])
    .png()
    .toBuffer();
  await sharp(comp1)
    .composite([{ input: roundMask(W1, H1, 24), blend: 'dest-in' }])
    .webp({ quality: 92 })
    .toFile(path.join(outDir, 'frame1-composite.webp'));
  console.log('Created frame1-composite.webp with rounded corners');

  // 2. Frame 2 (Ilva & Ricky Strip, 400 x 1206)
  const W2 = 400, H2 = 1206;
  const s2 = 400 / 1194;
  const svg2 = createPhotosSVG(
    W2,
    H2,
    [
      { x: Math.round(73 * s2), y: Math.round(245 * s2), w: Math.round(1054 * s2), h: Math.round(702 * s2), rx: 5, two: false },
      { x: Math.round(73 * s2), y: Math.round(1041 * s2), w: Math.round(1054 * s2), h: Math.round(702 * s2), rx: 5, two: true },
      { x: Math.round(73 * s2), y: Math.round(1829 * s2), w: Math.round(1054 * s2), h: Math.round(702 * s2), rx: 5, two: false }
    ],
    [
      ["#6ee7b7", "#0f766e"],
      ["#93c5fd", "#2563eb"],
      ["#7dd3fc", "#0284c7"]
    ]
  );
  const p2Buf = await sharp(Buffer.from(svg2)).resize(W2, H2).png().toBuffer();
  const f2Buf = await sharp('frame2-3d.webp').resize(W2, H2).png().toBuffer();
  const comp2 = await sharp(f2Buf)
    .composite([{ input: p2Buf, blend: 'dest-over', top: 0, left: 0 }])
    .png()
    .toBuffer();
  await sharp(comp2)
    .composite([{ input: roundMask(W2, H2, 18), blend: 'dest-in' }])
    .webp({ quality: 92 })
    .toFile(path.join(outDir, 'frame2-composite.webp'));
  console.log('Created frame2-composite.webp with rounded corners');

  // 3. Frame 3 (Jaya & Rika, 600 x 900)
  const W3 = 600, H3 = 900;
  const s3 = 600 / 1200;
  const svg3 = createPhotosSVG(
    W3,
    H3,
    [
      { x: Math.round(83 * s3), y: Math.round(130 * s3), w: Math.round(1035 * s3), h: Math.round(593 * s3), rx: 6, two: false },
      { x: Math.round(83 * s3), y: Math.round(764 * s3), w: Math.round(1035 * s3), h: Math.round(593 * s3), rx: 6, two: true }
    ],
    [
      ["#a5b4fc", "#2563eb"],
      ["#93c5fd", "#0284c7"]
    ]
  );
  const p3Buf = await sharp(Buffer.from(svg3)).resize(W3, H3).png().toBuffer();
  const f3Buf = await sharp('frame3-3d.webp').resize(W3, H3).png().toBuffer();
  const comp3 = await sharp(f3Buf)
    .composite([{ input: p3Buf, blend: 'dest-over', top: 0, left: 0 }])
    .png()
    .toBuffer();
  await sharp(comp3)
    .composite([{ input: roundMask(W3, H3, 24), blend: 'dest-in' }])
    .webp({ quality: 92 })
    .toFile(path.join(outDir, 'frame3-composite.webp'));
  console.log('Created frame3-composite.webp with rounded corners');
}

run().catch(err => console.error(err));
