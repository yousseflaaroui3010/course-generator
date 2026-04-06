import fs from 'fs';

async function testUpload() {
  const formData = new FormData();
  const fileContent = Buffer.from('%PDF-1.4\n%EOF\n');
  const blob = new Blob([fileContent], { type: 'application/pdf' });
  formData.append('file', blob, 'test.pdf');

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
