import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

/**
 * Returns true for errors that should trigger a Groq fallback.
 * Covers: quota/rate-limit, service unavailable, AND Windows TCP drops (wsarecv).
 */
const isRetryable = (error) => {
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('rate limit') ||
    msg.includes('unavailable') ||
    msg.includes('503') ||
    msg.includes('500') ||
    msg.includes('wsarecv') ||           // Windows TCP connection aborted
    msg.includes('stream reading error') || // Gemini stream drop
    msg.includes('econnreset') ||        // generic TCP reset
    msg.includes('econnrefused') ||
    msg.includes('socket hang up') ||
    msg.includes('network error')
  );
};

/**
 * Safely extracts a JSON object from raw AI output.
 *
 * Priority order of extraction strategies:
 *   1. Entire content is already valid JSON            → parse directly
 *   2. <think>…</think> block → strip it, parse remainder
 *   3. JSON found INSIDE the <think> block (Qwen puts answer in think block)
 *   4. Markdown code fence   → strip fences, parse interior
 *   5. Extract substring between first '{' and last '}'
 *   6. All of the above + repair unescaped LaTeX backslashes (\pi → \\pi)
 *
 * Does NOT corrupt valid JSON escape sequences.
 * Does NOT destroy mathematical notation.
 */
export const safeExtractJSON = (rawContent) => {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('safeExtractJSON: empty or non-string content received');
  }

  // ── Helper: attempt JSON.parse, return null on failure ──────────────────
  const tryParse = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  // ── Helper: repair LaTeX backslashes and retry ───────────────────────────
  // A bare backslash in JSON is only valid before: " \ / b f n r t u[XXXX]
  // LaTeX uses \pi, \frac, \cup, \theta, \sqrt, etc. — all invalid in raw JSON.
  const repairAndParse = (str) => {
    const repaired = str.replace(/\\(?!["\\/bfnrtu0-9])/g, '\\\\');
    return tryParse(repaired);
  };

  // ── Helper: extract the outermost {...} block ────────────────────────────
  const extractBraceBlock = (str) => {
    const start = str.indexOf('{');
    const end   = str.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    return str.substring(start, end + 1);
  };

  let content = rawContent.trim();

  // ── Strategy 1: whole string is valid JSON already ──────────────────────
  let parsed = tryParse(content);
  if (parsed) {
    console.log('[AI] JSON extraction: success (direct parse)');
    return parsed;
  }

  // ── Strategy 2: strip markdown code fences ──────────────────────────────
  const fenceStripped = content
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .trim();

  parsed = tryParse(fenceStripped) || repairAndParse(fenceStripped);
  if (parsed) {
    console.log('[AI] JSON extraction: success (fence-stripped)');
    return parsed;
  }

  // ── Strategy 3: handle <think> blocks ───────────────────────────────────
  if (content.includes('<think>')) {

    // 3a: strip think block and parse what remains
    const afterThink = content
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .trim();

    if (afterThink.length > 0) {
      parsed = tryParse(afterThink) || repairAndParse(afterThink);
      if (parsed) {
        console.log('[AI] JSON extraction: success (after stripping <think>)');
        return parsed;
      }
      // Try brace extraction on the remainder
      const braceBlock = extractBraceBlock(afterThink);
      if (braceBlock) {
        parsed = tryParse(braceBlock) || repairAndParse(braceBlock);
        if (parsed) {
          console.log('[AI] JSON extraction: success (brace-extracted after <think> strip)');
          return parsed;
        }
      }
    }

    // 3b: JSON is INSIDE the <think> block (Qwen sometimes does this)
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
    if (thinkMatch) {
      const insideThink = thinkMatch[1].trim();
      const braceBlock  = extractBraceBlock(insideThink);
      if (braceBlock) {
        parsed = tryParse(braceBlock) || repairAndParse(braceBlock);
        if (parsed) {
          console.log('[AI] JSON extraction: success (extracted from inside <think>)');
          return parsed;
        }
      }
    }

    // 3c: no closing </think> — treat everything after <think> as content
    const openIdx = content.indexOf('<think>');
    const afterOpen = content.substring(openIdx + 7).trim();
    const braceBlock = extractBraceBlock(afterOpen);
    if (braceBlock) {
      parsed = tryParse(braceBlock) || repairAndParse(braceBlock);
      if (parsed) {
        console.log('[AI] JSON extraction: success (unclosed <think> fallback)');
        return parsed;
      }
    }
  }

  // ── Strategy 4: extract brace block from original content ────────────────
  const braceBlock = extractBraceBlock(content);
  if (braceBlock) {
    parsed = tryParse(braceBlock) || repairAndParse(braceBlock);
    if (parsed) {
      console.log('[AI] JSON extraction: success (brace-extracted from raw content)');
      return parsed;
    }
  }

  // ── All strategies exhausted ─────────────────────────────────────────────
  const preview = rawContent.substring(0, 300).replace(/\n/g, ' ');
  throw new Error(
    `safeExtractJSON: could not extract valid JSON from AI response.\n` +
    `Raw preview (first 300 chars): ${preview}`
  );
};

export const aiService = {
  generateAIResponse: async (prompt, systemInstruction) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey   = process.env.GROQ_API_KEY;

    // ── 1. Try Gemini ────────────────────────────────────────────────────
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        console.log('[AI] Trying Gemini...');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.7,
          }
        });

        if (response.text) {
          console.log('[AI] Gemini success');
          return { provider: 'gemini', content: response.text };
        }
        throw new Error('Empty response text from Gemini');

      } catch (geminiError) {
        console.error('[AI] Gemini failed:', geminiError.message);

        if (isRetryable(geminiError)) {
          console.log('[AI] Gemini not available. Falling back to Groq...');
          if (!groqKey || groqKey === 'your_groq_key_here') {
            throw new Error('Fallback failed: GROQ_API_KEY is not configured');
          }
          return await callGroq(prompt, systemInstruction, groqKey);
        }
        throw geminiError;
      }

    } else {
      // ── 2. No Gemini key — use Groq directly ──────────────────────────
      console.log('[AI] No Gemini key configured. Using Groq directly...');
      if (!groqKey) throw new Error('AI Service failed: no API keys configured');
      return await callGroq(prompt, systemInstruction, groqKey);
    }
  }
};

// ────────────────────────────────────────────────────────────────────────────
const callGroq = async (prompt, systemInstruction, apiKey) => {
  console.log('[AI] Provider: Groq');
  const groqModel = 'qwen/qwen3.6-27b';
  const groq = new Groq({ apiKey });

  // Merged system instruction: original rules + strict JSON output rules.
  // Also instructs the model to skip its <think> reasoning block entirely.
  const groqSystem = `${systemInstruction}

═══ OUTPUT FORMAT — MANDATORY ═══
You MUST return a single valid JSON object.
Rules:
- NO <think> tags. Do not reason aloud. Output the JSON directly.
- NO markdown code fences (no \`\`\`json or \`\`\`).
- NO text before or after the JSON object.
- NO explanations, introductions, conclusions, or commentary.
- The response must begin with { and end with }.
- All JSON string values must be properly escaped.
- Mathematical notation inside strings: use double-backslash.
  Examples: \\\\pi  \\\\frac{a}{b}  \\\\sqrt{x}  \\\\theta  \\\\cup
- Caret notation (x^2) does not need escaping.
- All other backslashes must be double-escaped: \\\\\\\\.
`;

  const groqUserPrompt = `${prompt}

Return ONLY valid JSON. Start your response with { and end with }. No other text.`;

  try {
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        { role: 'system', content: groqSystem },
        { role: 'user',   content: groqUserPrompt }
      ],
      temperature: 0.6,
      // Disable Qwen3 thinking mode so the model outputs JSON directly
      // without wrapping its reasoning in <think> blocks.
      // eslint-disable-next-line camelcase
      thinking: { type: 'disabled' },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) throw new Error('Groq returned empty content');

    console.log('[AI] Raw response received');
    console.log('[AI] Groq success. Raw length:', rawContent.length);

    return { provider: 'groq', content: rawContent };

  } catch (groqError) {
    console.error('[AI] Groq failed:', groqError.message);
    throw groqError;
  }
};

export default aiService;
