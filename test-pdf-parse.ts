import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const fs = require('fs');

async function test() {
  try {
    const dataBuffer = Buffer.from('%PDF-1.4\n%EOF\n');
    const data = await pdfParse(dataBuffer);
    console.log(data);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
