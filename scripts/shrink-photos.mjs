// Shrinks member photos in public/members so pages load fast.
// Usage: npm run shrink-photos
// Resizes anything wider than 800px and recompresses it, keeping the same filename.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = "public/members";
const MAX_WIDTH = 800;
const FORMATS = { ".jpg": "jpeg", ".jpeg": "jpeg", ".png": "png", ".webp": "webp" };

for (const file of await readdir(DIR)) {
  const format = FORMATS[path.extname(file).toLowerCase()];
  if (!format) continue;

  const filePath = path.join(DIR, file);
  const input = await readFile(filePath);
  const output = await sharp(input)
    .rotate() // apply phone camera orientation before stripping metadata
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .toFormat(format, { quality: 80 })
    .toBuffer();

  if (output.length >= input.length) {
    console.log(`${file}: already small (${kb(input.length)})`);
    continue;
  }
  await writeFile(filePath, output);
  console.log(`${file}: ${kb(input.length)} -> ${kb(output.length)}`);
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}
