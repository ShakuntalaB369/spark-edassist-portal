import './config/env.js';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

// Test both OpenAI-compatible models available on this key
const candidates = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b'];

for (const model of candidates) {
  console.log(`\n[DIAG] Testing: ${model}`);
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Reply with just the word YES.' }],
      max_tokens: 10,
      temperature: 0,
    });
    const content = response.choices[0]?.message?.content;
    console.log(`[DIAG] ✅ SUCCESS: ${model} → "${content?.trim()}"`);
  } catch (err) {
    console.log(`[DIAG] ❌ FAILED: ${model} → ${err.message.substring(0, 120)}`);
  }
}
