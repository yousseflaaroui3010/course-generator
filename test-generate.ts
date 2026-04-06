async function testGenerate() {
  try {
    const res = await fetch('http://localhost:8080/api/generate-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: 'test', level: 'Beginner', tone: 'Conversational', options: {} })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error(e);
  }
}

testGenerate();
