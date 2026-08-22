import { aiService } from './aiService.js';
import { ALLOWED_COUNTRIES, ALLOWED_SUBJECTS } from '../config/constants.js';

const validateReferences = (refs) => {
  if (!refs || !Array.isArray(refs)) return [];
  const validRefs = [];
  const urlsSeen = new Set();
  
  for (const ref of refs) {
    if (!ref || typeof ref !== 'object') continue;
    const { title, url, source } = ref;
    if (typeof title !== 'string' || typeof url !== 'string' || typeof source !== 'string') continue;
    
    if (!url.startsWith('https://')) continue;
    
    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.hostname || !parsedUrl.hostname.includes('.')) continue;
      
      const normalizedUrl = url.trim().toLowerCase();
      if (urlsSeen.has(normalizedUrl)) continue;
      
      urlsSeen.add(normalizedUrl);
      validRefs.push({
        title: title.trim(),
        source: source.trim(),
        url: url.trim()
      });
      
      if (validRefs.length >= 3) break;
    } catch (e) {
      continue;
    }
  }
  return validRefs;
};

export const skillEnhanceService = {
  generateQuestions: async (ageGroup, difficulty) => {
    // Randomly select subjects and global contexts for 10 questions
    const questionConfigs = Array.from({ length: 10 }, () => {
      const subject = ALLOWED_SUBJECTS[Math.floor(Math.random() * ALLOWED_SUBJECTS.length)];
      const globalContext = ALLOWED_COUNTRIES[Math.floor(Math.random() * ALLOWED_COUNTRIES.length)];
      return { subject, globalContext };
    });

    const systemInstruction = `
You are an expert educational assessment developer. Your task is to generate high-quality, clear, and pedagogically sound questions for the "Skill Enhance" system.
We are generating exactly 10 questions of mixed subjects and global contexts.
Each question MUST strictly align with the provided parameters:
- Student Age Group: ${ageGroup} (ensure vocabulary, reading level, and concepts are highly appropriate for this age range)
- Difficulty: ${difficulty} (ensure complexity, depth, and cognitive load are perfectly aligned with this difficulty level)

The prompt will specify the random combination of subject and global educational context / framework for each of the 10 questions.
For each question, the selected global context MUST meaningfully influence the question scenario or content (do not just attach a generic label; e.g. for Germany, use renewable energy/vocation/environment context; for Japan, use precision technology/cultural integration).

For each question, you MUST also generate a "references" array containing 1 to 3 reputable educational learning resources specifically relevant to the concept tested.
The resources should be age-appropriate for the student.
URLs must be syntactically valid HTTPS links from reputable platforms (e.g., Khan Academy, Britannica, NASA, National Geographic, MIT, Stanford, official university or government education sites, MDN, Python docs).
Do NOT invent URLs. Ensure the URLs are valid and functional.

Return ONLY a valid JSON object matching the following structure:
{
  "questions": [
    {
      "id": "string (unique index 0 to 9)",
      "question": "string (the question text)",
      "questionType": "string (either 'MCQ' or 'True/False' or 'Short Answer')",
      "options": ["string", "string", "string", "string"], // exactly 4 options for MCQ, exactly 2 for True/False, empty/omitted for Short Answer
      "correctAnswer": "string (correct option match, or correct expected text for Short Answer)",
      "subject": "string (must match the assigned subject)",
      "globalContext": "string (must match the assigned globalContext)",
      "category": "string (must be one of: 'Foundational', 'Applied', 'Collaborative', 'Reflective')",
      "bloomLevel": "string (must be one of: 'Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create')",
      "explanation": "string (short reasoning)",
      "references": [
        {
          "title": "string",
          "source": "string",
          "url": "string (valid HTTPS URL)"
        }
      ]
    }
  ]
}
`;

    const userPrompt = `Generate exactly 10 questions targeting age group ${ageGroup} with these specific configuration mappings:
${questionConfigs.map((cfg, idx) => `Question ${idx + 1}: Subject: "${cfg.subject}", Global Context: "${cfg.globalContext}"`).join('\n')}
`;

    const response = await aiService.generateAIResponse(userPrompt, systemInstruction);
    const text = response.content;
    if (!text) {
      throw new Error('Empty response received from AI service');
    }

    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch (_) {
      try {
        parsed = JSON.parse(JSON.parse(text.trim()));
      } catch (err) {
        throw new Error('Failed to parse AI output as JSON');
      }
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('AI response does not contain a valid questions array');
    }

    // Assign mapped configuration values if missing
    parsed.questions.forEach((q, idx) => {
      const config = questionConfigs[idx] || questionConfigs[0];
      if (!q.subject) q.subject = config.subject;
      if (!q.globalContext) q.globalContext = config.globalContext;
      if (!q.questionType) q.questionType = 'MCQ';
      if (!q.category) q.category = ['Foundational', 'Applied', 'Collaborative', 'Reflective'][idx % 4];
      if (!q.bloomLevel) q.bloomLevel = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'][idx % 6];
      if (!q.difficulty) q.difficulty = difficulty || 'Medium';
      if (!q.references) q.references = [];
      
      // Perform validation and cleanup
      q.references = validateReferences(q.references);
    });

    return parsed.questions;
  }
};
