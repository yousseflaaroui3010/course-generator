import fs from 'fs';

async function testUpload() {
  const formData = new FormData();
  const fileContent = Buffer.from('test');
  const blob = new Blob([fileContent], { type: 'text/plain' });
  formData.append('file', blob, 'test.txt');

  try {
    const res = await fetch('http://localhost:8080/api/upload', {
      method: 'POST',
      body: formData
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}

testUpload();
