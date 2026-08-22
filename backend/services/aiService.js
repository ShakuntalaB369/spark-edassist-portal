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
    let groqModel = 'qwen/qwen3.6-27b';
    const groq = new Groq({ apiKey });

    // Explicit Groq prompt guidelines to prevent json_validate_failed
    const groqSystemInstruction = `${systemInstruction}
    
CRITICAL GROQ RULES:
- You MUST return a valid JSON object matching the requested schema.
- Return JSON ONLY.
- Do NOT use Markdown formatting (do not wrap JSON in \`\`\`json or \`\`\`).
- Do NOT add commentary, preface, or conversational text.
- Do NOT add trailing commas.
- All property names and values must use double quotes.
`;

    const groqPrompt = `${prompt}
    
Return valid JSON only. Do not include markdown codeblocks or conversational text.`;
    
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        { role: 'system', content: groqSystemInstruction },
        { role: 'user', content: groqPrompt }
      ],
      // Remove response_format JSON mode constraint to prevent Groq schema check failures from Qwen's thinking tags
      temperature: 0.7,
    });

    let content = response.choices[0]?.message?.content;
    if (content) {
      console.log('[AI] Groq success. Raw length:', content.length);
      // Clean up think tags if present
      if (content.includes('<think>')) {
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }
      // Extract only the JSON block (from first '{' to last '}')
      const startJsonIdx = content.indexOf('{');
      const endJsonIdx = content.lastIndexOf('}');
      if (startJsonIdx !== -1 && endJsonIdx !== -1) {
        content = content.substring(startJsonIdx, endJsonIdx + 1);
      }
      return {
        provider: 'groq',
        content
      };
    }
    throw new Error('Empty response from Groq');
  } catch (groqError) {
    console.error('[AI] Groq failed:', groqError.message);
    throw groqError;
  }
};

export default aiService;
