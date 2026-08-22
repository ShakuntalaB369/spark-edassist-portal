import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

const isRetryable = (error) => {
  const msg = (error.message || '').toLowerCase();
  return msg.includes('429') ||
         msg.includes('resource_exhausted') ||
         msg.includes('quota exceeded') ||
         msg.includes('rate limit') ||
         msg.includes('unavailable') ||
         msg.includes('503') ||
         msg.includes('500');
};

/**
 * Safely extracts and repairs a JSON block from raw AI output.
 *
 * Handles:
 *  1. <think>...</think> tags prepended by reasoning models
 *  2. Markdown code fences (```json ... ```)
 *  3. Conversational prefix/suffix text around the JSON
 *  4. Unescaped backslashes from LaTeX math notation (e.g. \pi, \frac, \cup)
 *     which are NOT valid JSON escape sequences
 *
 * Does NOT corrupt valid JSON string escape sequences.
 */
export const safeExtractJSON = (rawContent) => {
  if (!rawContent) throw new Error('Empty content passed to safeExtractJSON');

  let content = rawContent;

  // Step 1: Strip <think>...</think> blocks (Qwen reasoning tags)
  if (content.includes('<think>')) {
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    console.log('[AI] Stripped <think> tags');
  }

  // Step 2: Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  // Step 3: Extract only the JSON object block (from first '{' to last '}')
  const startIdx = content.indexOf('{');
  const endIdx = content.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error('No valid JSON object block found in AI response');
  }
  content = content.substring(startIdx, endIdx + 1);
  console.log('[AI] JSON block extracted, length:', content.length);

  // Step 4: Try parsing as-is first
  try {
    const parsed = JSON.parse(content);
    console.log('[AI] JSON extraction successful (no repair needed)');
    return parsed;
  } catch (_firstError) {
    // Step 5: Repair unescaped backslashes from LaTeX math notation
    // A backslash in JSON is only valid when followed by: " \ / b f n r t u
    // Any other backslash (e.g. \pi, \frac, \cup, \theta) is invalid in JSON strings
    // We escape them to \\ so they survive JSON.parse and render correctly
    const repaired = content.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');

    try {
      const parsed = JSON.parse(repaired);
      console.log('[AI] JSON extraction successful (after LaTeX backslash repair)');
      return parsed;
    } catch (repairError) {
      throw new Error(
        `Failed to parse AI output as JSON even after repair.\nRepair error: ${repairError.message}\n` +
        `First 500 chars of extracted block:\n${content.substring(0, 500)}`
      );
    }
  }
};

export const aiService = {
  generateAIResponse: async (prompt, systemInstruction) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // 1. Try Gemini first
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
          return {
            provider: 'gemini',
            content: response.text
          };
        }
        throw new Error('Empty response text from Gemini');
      } catch (geminiError) {
        console.error('[AI] Gemini failed:', geminiError.message);

        // 2. Check if error is retryable, if so fallback to Groq
        if (isRetryable(geminiError)) {
          console.log('[AI] Gemini quota or rate limit exceeded. Falling back to Groq...');
          if (!groqKey || groqKey === 'your_groq_key_here') {
            throw new Error('Fallback failed: GROQ_API_KEY is not defined or is placeholder');
          }
          return await callGroq(prompt, systemInstruction, groqKey);
        } else {
          // If non-retryable error (e.g. invalid parameter/request), throw immediately
          throw geminiError;
        }
      }
    } else {
      // If no Gemini key is set, fallback to Groq directly
      console.log('[AI] No Gemini API key found. Trying Groq directly...');
      if (!groqKey) {
        throw new Error('AI Service failed: No API keys configured');
      }
      return await callGroq(prompt, systemInstruction, groqKey);
    }
  }
};

const callGroq = async (prompt, systemInstruction, apiKey) => {
  try {
    console.log('[AI] Trying Groq...');
    const groqModel = 'qwen/qwen3.6-27b';
    const groq = new Groq({ apiKey });

    const groqSystemInstruction = `${systemInstruction}

CRITICAL OUTPUT RULES:
- Return a single valid JSON object ONLY.
- Do NOT wrap the JSON in markdown code fences (no \`\`\`json or \`\`\`).
- Do NOT add any explanatory text, introduction, or conclusion outside the JSON.
- All JSON string values must use properly escaped characters.
- Mathematical notation must be written as valid JSON strings:
  - Write \\pi instead of \pi
  - Write \\frac{a}{b} instead of \frac{a}{b}
  - Write \\cup instead of \cup
  - Write \\theta instead of \theta
  - Write x^2 as-is (no backslash needed for caret)
- All backslashes inside JSON strings must be double-escaped (\\\\).
- All double quotes inside JSON strings must be escaped (\\\").
`;

    const groqPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON. No markdown. No explanatory text. No code fences.`;

    console.log('[AI] Raw response received');
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        { role: 'system', content: groqSystemInstruction },
        { role: 'user', content: groqPrompt }
      ],
      temperature: 0.7,
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Empty response from Groq');
    }

    console.log('[AI] Groq success. Raw length:', rawContent.length);

    // Return raw content — parsing/repairing is handled in aiAssessmentService
    return {
      provider: 'groq',
      content: rawContent
    };
  } catch (groqError) {
    console.error('[AI] Groq failed:', groqError.message);
    throw groqError;
  }
};

export default aiService;
