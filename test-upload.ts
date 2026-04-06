import fs from 'fs';

async function testUpload() {
  const formData = new FormData();
  const fileContent = fs.readFileSync('package.json');
  const blob = new Blob([fileContent], { type: 'application/json' });
  formData.append('file', blob, 'package.json');

  try {
    const res = await fetch('http://localhost:8080/api/upload', {
      method: 'POST',
      body: formData
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error(e);
  }
}

testUpload();
