import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/health');
    const data = await res.json();
    console.log('API Response:', data);
  } catch (e: any) {
    console.error('API Test Error:', e.message);
  }
}

test();
