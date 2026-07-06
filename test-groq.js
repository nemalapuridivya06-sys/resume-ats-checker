const { groqChat } = require('./lib/llm/client.ts');
// We need to use ts-node or just rewrite the test in ts and compile it, or write a plain js test.

// Since we are in an ES environment or Node, let's just write a direct JS test for the API
async function testGroqAPI(apiKey) {
  console.log('Testing Groq API with key:', apiKey ? 'PROVIDED (hidden)' : 'NOT PROVIDED');
  
  if (!apiKey) {
    console.log('=> Expected Result: return null (Triggers Deterministic Fallback)');
    // Simulate what client.ts does
    return null;
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say hello world' }],
        max_tokens: 50
      }),
    });

    console.log('HTTP Status:', res.status);
    if (!res.ok) {
      console.log('=> Expected Result: return null on non-200');
      return null;
    }
    const data = await res.json();
    console.log('Response Content:', data?.choices?.[0]?.message?.content);
    return data;
  } catch (err) {
    console.error('Fetch Error:', err);
    return null;
  }
}

async function runTests() {
  console.log('--- TEST 1: No API Key (Fallback Mode) ---');
  await testGroqAPI('');

  console.log('\\n--- TEST 2: Invalid API Key ---');
  await testGroqAPI('gsk_invalidKey1234567890');

  console.log('\\n--- DONE ---');
}

runTests();
